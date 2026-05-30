import subprocess
import json

def run_cmd(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    if result.returncode != 0:
        raise Exception(f"Command failed: {cmd}\nError: {result.stderr}")
    return result.stdout.strip()

try:
    print("[INFO] Fetching task list from ECS cluster...")
    tasks_json = run_cmd("aws ecs list-tasks --cluster mess-cluster --region ap-south-1 --output json")
    task_arns = json.loads(tasks_json).get("taskArns", [])
    
    if not task_arns:
        print("[WARNING] No tasks currently exist in the cluster.")
    else:
        print(f"[INFO] Found {len(task_arns)} active task(s). Fetching details...")
        
        # Describe tasks
        tasks_details_json = run_cmd(f"aws ecs describe-tasks --cluster mess-cluster --tasks {' '.join(task_arns)} --region ap-south-1 --output json")
        tasks = json.loads(tasks_details_json).get("tasks", [])
        
        for task in tasks:
            task_id = task["taskArn"].split("/")[-1]
            last_status = task.get("lastStatus", "UNKNOWN")
            stopped_reason = task.get("stoppedReason", "N/A")
            pull_started = task.get("pullStartedAt", "N/A")
            print(f"\n==================================================")
            print(f"Task ID: {task_id}")
            print(f"Last Status: {last_status}")
            print(f"Stopped Reason: {stopped_reason}")
            print(f"Pull Started At: {pull_started}")
            
            print("Containers:")
            for container in task.get("containers", []):
                c_name = container.get("name", "unknown")
                c_status = container.get("lastStatus", "UNKNOWN")
                c_reason = container.get("reason", "None")
                print(f"  - Container: {c_name} | Status: {c_status} | Reason: {c_reason}")
            
            # Check for any task-level execution/pull errors
            task_failures = task.get("failures", [])
            if task_failures:
                print(f"Failures: {task_failures}")
            
except Exception as e:
    print(f"\n[ERROR] Diagnostics failed: {e}")
