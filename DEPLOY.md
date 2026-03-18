# Deploy: Single Vercel Project

## Prerequisites

- Code pushed to **GitHub** .
- **MongoDB Atlas** free cluster and connection string ([cloud.mongodb.com](https://cloud.mongodb.com)).
- **Vercel** account ([vercel.com](https://vercel.com)).

---

## Part 1: Prepare MongoDB Atlas

1. **Create MongoDB Atlas database (if needed)**  
   - Create a cluster → Connect → get the connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`.
   - Network Access → Add IP → allow `0.0.0.0/0` so Vercel can connect.

---

## Part 2: Import the Repo on Vercel

1. **Create a Vercel project**  
   - Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.  
   - Import your GitHub repo (e.g. `Test-project`).

2. **Configure the project settings**  
   - **Root Directory**: leave as the repo root.
   - **Framework Preset**: `Other`.
   - **Install Command**: `npm install`.
   - **Build Command**: `npm run build`.
   - **Output Directory**: `frontend/dist`.

3. **Add environment variables**  
   - In **Environment Variables**, add:

   | Name           | Value |
   |----------------|--------|
   | `MONGO_URI`    | Your Atlas connection string (e.g. `mongodb+srv://...`) |
   | `JWT_SECRET`   | A long random string (e.g. generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
   | `CLIENT_URL`   | Your Vercel frontend URL, e.g. `https://your-app.vercel.app` |

   - Apply them to **Production** and **Preview** if desired.
   - `VITE_API_URL` is optional in this setup because the frontend will use same-origin `/api` in production by default.

4. **Deploy**  
   - Click **Deploy**.  
   - When it finishes, copy your app URL, e.g. `https://your-app.vercel.app`.

---

## Part 3: Verify the Deployment

1. **Test the API**  
   - Open `https://your-app.vercel.app/api/health` in a browser. You should see `{"status":"ok"}`.

2. **Test the frontend**  
   - Open your Vercel URL in a browser.  
   - Register or log in and use the app; API calls should go to the same Vercel deployment under `/api`.

---

## Quick reference

| Where  | Variable       | Example |
|--------|----------------|---------|
| Vercel | `MONGO_URI`    | `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority` |
| Vercel | `JWT_SECRET`   | Long random string (e.g. 32+ chars) |
| Vercel | `CLIENT_URL`   | `https://your-app.vercel.app` |
| Vercel | `VITE_API_URL` | Optional. Leave unset for same-origin `/api`, or set `https://your-app.vercel.app/api` explicitly |

---

## Troubleshooting

- **Build fails with `vite: command not found`**: Ensure Vercel is deploying the repo root with `npm install` so npm workspaces install both `frontend` and `backend`.
- **CORS errors**: Ensure `CLIENT_URL` exactly matches your Vercel URL, including protocol and no trailing slash.
- **401 / auth errors**: Ensure `JWT_SECRET` is set on Vercel and hasn’t changed after users logged in.
- **API not reachable**: Check `https://your-app.vercel.app/api/health` and confirm `MONGO_URI` is set correctly.
- **Blank page or 404 on refresh**: Redeploy after confirming the root `vercel.json` is present so SPA routes rewrite to `index.html`.
