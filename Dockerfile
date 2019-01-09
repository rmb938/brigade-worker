FROM deis/brigade-worker:v0.19.0

COPY sops.js /home/src/dist
COPY notification.js /home/src/dist
