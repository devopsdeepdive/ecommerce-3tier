To delete all running pods in the current Kubernetes namespace with a single command, use:

```bash
kubectl delete pods --all
```

This command deletes all pods regardless of their labels or status within the namespace you are currently working in.

If you want to delete pods in a specific namespace, add the `-n` option, for example:

```bash
kubectl delete pods --all -n your-namespace
```
