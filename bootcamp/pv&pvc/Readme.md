To apply this:

Make sure the AWS EBS CSI driver is installed in your cluster. If not, install it from the official repository:
https://github.com/kubernetes-sigs/aws-ebs-csi-driver
5/

Step 1: Install AWS CLI (if not installed)
On master node and optionally on worker nodes:
Step 2: Create IAM Role or Attach IAM Policy to EC2 Nodes
Create an IAM policy with EBS permissions (if not done).

Attach this policy to the EC2 instances’ IAM role or instance profile.

Example policy: AmazonEBSCSIDriverPolicy (AWS managed policy) can be attached.

Step 3: Install the AWS EBS CSI Driver via Helm or YAML
Option A: Using the official YAML manifests
Run the following commands on the master node:
