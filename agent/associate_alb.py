import subprocess
import json

def run_cmd(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    if result.returncode != 0:
        raise Exception(f"Command failed: {cmd}\nError: {result.stderr}")
    return result.stdout.strip()

try:
    print("Fetching Target Group ARN...")
    tg_json = run_cmd("aws elbv2 describe-target-groups --names tg-mess-agent --region ap-south-1 --output json")
    tg_arn = json.loads(tg_json)["TargetGroups"][0]["TargetGroupArn"]
    print(f"Target Group ARN: {tg_arn}")

    print("Fetching Load Balancer ARN...")
    alb_json = run_cmd("aws elbv2 describe-load-balancers --names mess-alb --region ap-south-1 --output json")
    alb_arn = json.loads(alb_json)["LoadBalancers"][0]["LoadBalancerArn"]
    print(f"Load Balancer ARN: {alb_arn}")

    print("Fetching Listener ARN...")
    listener_json = run_cmd(f"aws elbv2 describe-listeners --load-balancer-arn {alb_arn} --region ap-south-1 --output json")
    listeners = json.loads(listener_json)["Listeners"]
    listener_arn = [l["ListenerArn"] for l in listeners if l["Port"] == 80][0]
    print(f"Listener ARN: {listener_arn}")

    print("Creating listener rule...")
    rule_cmd = (
        f"aws elbv2 create-rule --listener-arn {listener_arn} --priority 1 "
        f"--conditions Field=path-pattern,Values='/agent/*','/health' "
        f"--actions Type=forward,TargetGroupArn={tg_arn} --region ap-south-1 --output json"
    )
    rule_output = run_cmd(rule_cmd)
    print("Success! Rule created successfully!")

except Exception as e:
    print(f"Error: {e}")
