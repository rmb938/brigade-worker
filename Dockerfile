FROM deis/brigade-worker:v0.19.0

COPY sops.js /home/src/dist
COPY github-check-notification.js /home/src/dist
COPY github-notify.js /home/src/dist
