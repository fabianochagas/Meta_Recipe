# this will createa a " ajinomatrix-stack1" network 
# from 172.171.0.0 to 172.171.1.255
docker network create \
  --driver=bridge \
  --subnet=172.171.0.0/23 \
  --ip-range=172.171.1.0/24 \
  --gateway=172.171.1.1 \
  ajinomatrix-stack1