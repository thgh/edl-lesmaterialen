FROM node:22-alpine
WORKDIR /app

COPY public ./public
COPY .next/standalone ./
COPY .next/static ./.next/static

EXPOSE 80
ENV PORT=80
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "server.js"]