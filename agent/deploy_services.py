import subprocess
import json
import sys

def run_cmd(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    if result.returncode != 0:
        raise Exception(f"Command failed: {cmd}\nError: {result.stderr}")
    return result.stdout.strip()

try:
    print("[INFO] Gathering AWS resource details in ap-south-1...")

    # 1. Get Target Group ARNs
    print("- Fetching Backend Target Group ARN...")
    tg_backend_json = run_cmd("aws elbv2 describe-target-groups --names tg-mess-backend --region ap-south-1 --output json")
    tg_backend_arn = json.loads(tg_backend_json)["TargetGroups"][0]["TargetGroupArn"]
    print(f"  Backend TG: {tg_backend_arn}")

    print("- Fetching Agent Target Group ARN...")
    tg_agent_json = run_cmd("aws elbv2 describe-target-groups --names tg-mess-agent --region ap-south-1 --output json")
    tg_agent_arn = json.loads(tg_agent_json)["TargetGroups"][0]["TargetGroupArn"]
    print(f"  Agent TG: {tg_agent_arn}")

    # 2. Get Security Group ID
    print("- Fetching Tasks Security Group ID...")
    sg_json = run_cmd("aws ec2 describe-security-groups --group-names mess-tasks-sg --region ap-south-1 --output json")
    sg_id = json.loads(sg_json)["SecurityGroups"][0]["GroupId"]
    print(f"  Security Group ID: {sg_id}")

    # 3. Get Subnets from the Load Balancer
    print("- Fetching subnets from Load Balancer 'mess-alb'...")
    alb_json = run_cmd("aws elbv2 describe-load-balancers --names mess-alb --region ap-south-1 --output json")
    alb_info = json.loads(alb_json)["LoadBalancers"][0]
    subnets = [az["SubnetId"] for az in alb_info["AvailabilityZones"]]
    print(f"  Subnets: {subnets}")

    # 4. Define services configuration
    services = [
        {
            "name": "mess-backend-service",
            "task_def": "mess-backend-task",
            "container_name": "mess-backend",
            "port": 8080,
            "tg_arn": tg_backend_arn
        },
        {
            "name": "mess-agent-service",
            "task_def": "mess-agent-task",
            "container_name": "mess-agent",
            "port": 8000,
            "tg_arn": tg_agent_arn
        }
    ]

    for svc in services:
        print(f"\n[INFO] Creating service '{svc['name']}'...")
        
        # Create input JSON for ecs service
        svc_config = {
            "cluster": "mess-cluster",
            "serviceName": svc["name"],
            "taskDefinition": svc["task_def"],
            "loadBalancers": [
                {
                    "targetGroupArn": svc["tg_arn"],
                    "containerName": svc["container_name"],
                    "containerPort": svc["port"]
                }
            ],
            "desiredCount": 1,
            "launchType": "FARGATE",
            "networkConfiguration": {
                "awsvpcConfiguration": {
                    "subnets": subnets,
                    "securityGroups": [sg_id],
                    "assignPublicIp": "ENABLED"
                }
            }
        }

        config_file = f"config-{svc['name']}.json"
        with open(config_file, "w") as f:
            json.dump(svc_config, f, indent=2)
            
        print(f"  Generated configuration file: {config_file}")
        
        # Run aws ecs create-service
        create_cmd = f"aws ecs create-service --cli-input-json file://{config_file} --region ap-south-1 --output json"
        run_cmd(create_cmd)
        print(f"  SUCCESS: Service '{svc['name']}' created successfully!")

    print("\n[SUCCESS] Both services have been successfully deployed and are booting up on Fargate!")
    print("You can monitor their status in the ECS Console under 'mess-cluster' -> 'Services'.")

except Exception as e:
    print(f"\n[ERROR] Error: {e}")
