# Apps Script Integration Setup

This document explains how to connect your SaaS planning platform to a Google Apps Script model for scenario running.

## Prerequisites

1. A Google Apps Script project with the scenario runner code
2. The Apps Script project deployed as a web app
3. Environment variables configured in your Next.js app

## Apps Script Setup

### 1. Add the Core Functions

Add these functions to your Apps Script project:

```javascript
/** Core runner used by both UI menu and API. Returns a JSON summary. */
function runScenarioCore_(prompt, opts) {
  opts = opts || {};
  if (!prompt || !String(prompt).trim()) throw new Error('Missing prompt');

  // UI hooks (optional)
  var ss = SpreadsheetApp.getActive();
  var shSc = ss.getSheetByName('Scenario');
  if (opts.updateUi !== false && shSc) {
    shSc.getRange('A3').setValue(prompt);
  }

  // RUN_ID + registry
  var runId = _makeRunIdV2();
  if (opts.updateUi !== false && shSc) {
    shSc.getRange('B5').setValue(runId); // show RUN_ID
  }
  var user = Session.getActiveUser().getEmail() || 'api@system';
  var started = new Date();
  _appendRow_('Run_Registry', [runId, prompt, user, started, '', 'RUNNING', '', '', '', '', '']);

  // DataOps
  _freezeBeforeV2_(runId);

  // ModelOps
  var parsed = _parsePromptV2_(prompt);
  for (var i=0;i<(parsed.deltas||[]).length;i++) {
    var d = parsed.deltas[i];
    _appendRow_('Agent_ModelOps', [new Date(), runId, 'arr_delta_usd', d.scopeType+':'+d.scopeVal, d.amount, 'absolute_usd', 'requested']);
  }
  if (parsed.totalUsd != null) {
    _appendRow_('Agent_ModelOps', [new Date(), runId, 'total_arr_target', 'ALL', parsed.totalUsd, 'absolute_usd', 'requested']);
  }

  // Runner (+ constraint reporting)
  var runnerRes = _applyDeltasAndComputeAfterV2_(runId, parsed);
  _appendRow_('Agent_Runner', [new Date(), runId, 1, runnerRes.rowsAfter, runnerRes.msg]);

  if (runnerRes.capUsd != null) {
    _appendRow_('Agent_Constraints', [new Date(), runId,
      'total_arr_max_delta', (runnerRes.globalCapApplied?'BINDING':'PASS'),
      'Requested +$'+_fmtUsd(runnerRes.requestedTotalUsd)+' vs cap $'+_fmtUsd(runnerRes.capUsd)]);
  }
  if (runnerRes.capsStatus && runnerRes.capsStatus.length) {
    for (var ci=0; ci<runnerRes.capsStatus.length; ci++) {
      var cs = runnerRes.capsStatus[ci];
      _appendRow_('Agent_Constraints', [new Date(), runId, cs.rule, (cs.binding?'BINDING':'PASS'),
        'Initial +$'+_fmtUsd(cs.initialUsd)+' → final +$'+_fmtUsd(cs.finalUsd)+' (cap $'+_fmtUsd(cs.capUsd)+')']);
    }
  }

  // QA
  _buildDeltasV2_(runId);
  _qaSuiteV2_(runId);

  // Narrative
  var narrative = _draftNarrativeV2_(runId, prompt, runnerRes);
  _appendRow_('Agent_Narrator', [new Date(), runId, narrative]);
  _appendRow_('Narratives', [new Date(), runId, narrative]);
  if (opts.updateUi !== false && shSc) shSc.getRange('A13').setValue(narrative);

  // Audit + finalize
  var beforeHash = _hashTableRows_(_readTaggedRows_('Outputs_Before','RUN_ID',runId));
  var afterHash  = _hashTableRows_(_readTaggedRows_('Outputs_After','RUN_ID',runId));
  _appendRow_('Agent_Audit', [new Date(), runId, 'Outputs_Before', beforeHash, 'BEFORE snapshot hash']);
  _appendRow_('Agent_Audit', [new Date(), runId, 'Outputs_After',  afterHash,  'AFTER snapshot hash']);
  _updateRegistry_(runId, { finished_at: new Date(), status: 'DONE', before_hash: beforeHash, after_hash: afterHash });

  // Build a compact summary for API callers
  var deltas = _readRecords_('VW_Deltas').filter(function(r){ return String(r.RUN_ID)===runId && String(r.metric).toUpperCase()==='ARR'; });
  var totalBefore=0, totalAfter=0, totalDelta=0;
  for (var k=0;k*deltas.length;k++); // placeholder to avoid syntax issues
  for (var i2=0;i2<deltas.length;i2++){
    totalBefore += Number(deltas[i2].before||0);
    totalAfter  += Number(deltas[i2].after||0);
    totalDelta  += Number(deltas[i2].delta||0);
  }

  return {
    run_id: runId,
    prompt: prompt,
    arr_before: Math.round(totalBefore),
    arr_after: Math.round(totalAfter),
    arr_delta: Math.round(totalDelta),
    caps: runnerRes.capsStatus || [],
    narrative: narrative
  };
}

// API Endpoints
function doPost(e) {
  try {
    var params = e.parameter || {};
    var body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    var key = params.key || body.key || '';
    var ok = (key && key === PropertiesService.getScriptProperties().getProperty('API_KEY'));
    if (!ok) return _json_(401, {error:'unauthorized'});

    var prompt = body.prompt || params.prompt;
    if (!prompt) return _json_(400, {error:'missing prompt'});

    var summary = runScenarioCore_(prompt, {updateUi:false});
    return _json_(200, { ok:true, ...summary });

  } catch (err) {
    return _json_(500, { ok:false, error: String(err && err.message || err) });
  }
}

function doGet(e) {
  try {
    var params = e.parameter || {};
    var key = params.key || '';
    var ok = (key && key === PropertiesService.getScriptProperties().getProperty('API_KEY'));
    if (!ok) return _json_(401, {error:'unauthorized'});

    var res = (params.resource || '').toLowerCase();
    var runId = params.run_id;

    if (res === 'vw_deltas') {
      if (!runId) return _json_(400, {error:'missing run_id'});
      var rows = _readRecords_('VW_Deltas').filter(function(r){ return String(r.RUN_ID)===runId; });
      return _json_(200, { ok:true, run_id: runId, rows: rows });
    }

    if (res === 'run_status') {
      if (!runId) return _json_(400, {error:'missing run_id'});
      var rr = _readRecords_('Run_Registry').filter(function(r){ return String(r.RUN_ID)===runId; });
      return _json_(200, { ok:true, row: rr[0] || null });
    }

    if (res === 'narrative') {
      if (!runId) return _json_(400, {error:'missing run_id'});
      var n = _readRecords_('Narratives').filter(function(r){ return String(r.RUN_ID)===runId; });
      return _json_(200, { ok:true, run_id: runId, narrative: (n[0] && n[0].narrative) || '' });
    }

    return _json_(400, {error:'unknown resource'});
  } catch (err) {
    return _json_(500, { ok:false, error: String(err && err.message || err) });
  }
}

function _json_(status, obj) {
  var out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
```

### 2. Set API Key

1. Go to Apps Script > Project Settings > Script properties
2. Add a new property:
   - **Property**: `API_KEY`
   - **Value**: A long random secret (e.g., `sk_1234567890abcdef...`)

### 3. Deploy as Web App

1. Go to Apps Script > Deploy > Manage deployments
2. Click "New deployment"
3. Choose "Web app" as the type
4. Set:
   - **Execute as**: Me
   - **Who has access**: Anyone with the link
5. Click "Deploy"
6. Copy the Web App URL

## Next.js Environment Variables

Create a `.env.local` file in your project root:

```bash
# Google Apps Script Configuration
GAS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GAS_KEY=your_long_random_secret_key_here
```

## Testing the Integration

### 1. Test Apps Script Directly

```bash
# Run a scenario
curl -X POST "$GAS_URL?key=$GAS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Increase total ARR by $10M; EMEA ≤ $2M; Enterprise ≤ $5M"}'

# Fetch VW deltas
curl "$GAS_URL?resource=vw_deltas&run_id=RUN_2025...&key=$GAS_KEY"
```

### 2. Test via Next.js API

```bash
# Run scenario via Next.js
curl -X POST "http://localhost:3000/api/run-scenario" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Increase total ARR by $10M"}'

# Fetch deltas via Next.js
curl "http://localhost:3000/api/vw-deltas?run_id=RUN_2025..."
```

## Usage in the Platform

1. Go to the **Scenarios** tab
2. Click **"Run Scenario"** button
3. Enter your scenario prompt (e.g., "Increase total ARR by $10M; EMEA ≤ $2M")
4. Click **"Run Scenario"**
5. View results in the summary, deltas, and narrative tabs

## Example Scenario Prompts

- `"Increase total ARR by $10M; EMEA ≤ $2M; Enterprise ≤ $5M"`
- `"Reduce churn by 2% across all products"`
- `"Add $5M ARR from new enterprise customers in Q2"`
- `"Optimize pricing: increase by 15% for SMB segment"`

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key matches in both Apps Script and `.env.local`
2. **404 Not Found**: Verify the Apps Script web app URL is correct
3. **500 Internal Error**: Check Apps Script execution logs for errors
4. **CORS Issues**: The API calls are made server-side to avoid CORS problems

### Debug Steps

1. Check Apps Script execution logs
2. Verify environment variables are loaded
3. Test Apps Script endpoints directly
4. Check Next.js API route logs
5. Verify spreadsheet permissions

## Security Notes

- The API key provides access to your Apps Script web app
- Keep the API key secret and don't commit it to version control
- The web app is set to "Anyone with the link" but requires the API key
- Consider implementing additional authentication if needed
