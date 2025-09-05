To delete all running pods in the current Kubernetes namespace with a single command, use:

```bash
kubectl delete pods --all
```

This command deletes all pods regardless of their labels or status within the namespace you are currently working in.

If you want to delete pods in a specific namespace, add the `-n` option, for example:

```bash
kubectl delete pods --all -n your-namespace
```
2. Apply multiple files together
If the manifests are in separate files, e.g., frontend.yaml, backend.yaml, and mysql.yaml, you can run:

bash
```
kubectl apply -f frontend.yaml -f backend.yaml -f mysql.yaml
```
or specify the folder if they are all saved together:

bash
```
kubectl apply -f ./manifests-folder/
```
This will also create all resources in one command.
