import subprocess
import json
import os

def run_cmd(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    if result.returncode != 0:
        raise Exception(f"Command failed: {cmd}\nError: {result.stderr}")
    return result.stdout.strip()

try:
    print("[INFO] Creating Trust Policy file...")
    trust_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "",
                "Effect": "Allow",
                "Principal": {
                    "Service": "ecs-tasks.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }
    
    with open("trust-policy.json", "w") as f:
        json.dump(trust_policy, f, indent=2)

    print("[INFO] Creating IAM Role 'ecsTaskExecutionRole'...")
    run_cmd("aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://trust-policy.json")
    print("  SUCCESS: Role 'ecsTaskExecutionRole' created!")

    print("[INFO] Attaching ECS Task Execution Policy...")
    run_cmd("aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy")
    print("  SUCCESS: ECS execution policy attached!")

    print("[INFO] Attaching SSM Read Only Policy (for secrets)...")
    run_cmd("aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess")
    print("  SUCCESS: SSM ReadOnly policy attached!")

    # Clean up temp policy file
    if os.path.exists("trust-policy.json"):
        os.remove("trust-policy.json")

    print("\n[SUCCESS] ecsTaskExecutionRole is now fully created and configured!")

except Exception as e:
    print(f"\n[ERROR] Error: {e}")
