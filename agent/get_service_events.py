import subprocess
import json

def run_cmd(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    if result.returncode != 0:
        raise Exception(f"Command failed: {cmd}\nError: {result.stderr}")
    return result.stdout.strip()

try:
    print("[INFO] Fetching service event logs from ECS cluster...")
    svc_json = run_cmd("aws ecs describe-services --cluster mess-cluster --services mess-backend-service mess-agent-service --region ap-south-1 --output json")
    services = json.loads(svc_json).get("services", [])
    
    for svc in services:
        name = svc.get("serviceName", "unknown")
        print(f"\n==================================================")
        print(f"Service: {name}")
        print(f"Desired Tasks: {svc.get('desiredCount')}")
        print(f"Running Tasks: {svc.get('runningCount')}")
        print(f"Pending Tasks: {svc.get('pendingCount')}")
        
        print("\nLast 8 Events:")
        events = svc.get("events", [])
        for i, ev in enumerate(events[:8]):
            print(f"  [{i+1}] {ev.get('createdAt')}: {ev.get('message')}")
            
except Exception as e:
    print(f"\n[ERROR] Service log fetch failed: {e}")
