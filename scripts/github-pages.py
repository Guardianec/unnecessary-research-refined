"""Publish only this fictional project. Credentials stay in memory, never in output."""
import json
import subprocess
import sys
import urllib.error
import urllib.request

OWNER = 'Guardianec'
REPO = 'unnecessary-research-refined'
result = subprocess.run(['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n', text=True, capture_output=True, check=True)
credential = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
token = credential.get('password')
if not token:
    raise SystemExit('GitHub credential unavailable. Sign in using Git Credential Manager.')

def api(path, method='GET', payload=None):
    request = urllib.request.Request('https://api.github.com' + path, method=method,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json',
                 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(request) as response:
        data = response.read()
        return json.loads(data) if data else {}

command = sys.argv[1] if len(sys.argv) > 1 else 'status'
if command == 'create':
    try:
        existing = api(f'/repos/{OWNER}/{REPO}')
        print('Repository already exists:', existing['html_url'])
    except urllib.error.HTTPError as error:
        if error.code != 404:
            raise
        created = api('/user/repos', 'POST', {'name': REPO, 'description': 'A Ukrainian interactive parody research report. All data and citations are fictional.', 'private': False, 'auto_init': False})
        print('Created:', created['html_url'])
elif command == 'pages':
    try:
        pages = api(f'/repos/{OWNER}/{REPO}/pages')
        print('Pages already configured:', pages.get('html_url'))
    except urllib.error.HTTPError as error:
        if error.code != 404:
            raise
        pages = api(f'/repos/{OWNER}/{REPO}/pages', 'POST', {'build_type': 'workflow'})
        print('Pages configured:', pages.get('html_url'))
elif command == 'status':
    runs = api(f'/repos/{OWNER}/{REPO}/actions/runs?per_page=3')
    print(json.dumps([{'id': r['id'], 'status': r['status'], 'conclusion': r['conclusion'], 'url': r['html_url']} for r in runs['workflow_runs']]))
else:
    raise SystemExit('Choose create, pages, or status.')
