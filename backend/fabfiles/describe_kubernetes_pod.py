"""
Main module used for saving any kubernetes information that the main frontend requires
for rendering pages.
"""
import sys
from fabric_wrapper import FabricConnectionWrapper


def describe_pod(pod_name: str):
    """
    Describes a pod by its name.
    """
    with FabricConnectionWrapper() as fab_conn:
        fab_conn.run('kubectl describe pod ' + pod_name)

def main():
    if len(sys.argv) != 2:
        print("You must pass in the kubernetes pod name.")
        exit(1)
        
    describe_pod(sys.argv[1])


if __name__ == '__main__':
    main()
