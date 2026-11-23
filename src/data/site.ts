import { siGithub, siItchdotio, siX } from "simple-icons";

// All page content lives here so updating the portfolio never means touching markup.

// `description` is optional: work entries show the full write-up, projects stay one-liners.
export type Item = { title: string; meta: string; href?: string; description?: string };

export const profile = {
  name: "Naman Jain",
  description:
    "Forward Deployed Engineer at Sarvam AI, building end-to-end AI solutions for clients on Sarvam's stack. Also into multi-agent AI workflows and full-stack products.",
  email: "jainnaman027@gmail.com",
};

// Each contact carries a 24x24 filled SVG path for its logo.
export type Contact = { label: string; href: string; icon: string };

// LinkedIn isn't in simple-icons (brand request), so its path is inlined;
// the email icon is Material Design's "mail" glyph.
const linkedinPath =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 4.887v6.316zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
const mailPath =
  "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z";

// Resume is hidden for now; to show it again add:
// { label: "Resume", href: "/Resume.pdf", icon: <a document path> }
// (the PDF is still served at /Resume.pdf).
export const links: Contact[] = [
  { label: "GitHub", href: "https://github.com/namanjain27", icon: siGithub.path },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jainnaman027/", icon: linkedinPath },
  { label: "Twitter", href: "https://x.com/jainnaman_27", icon: siX.path },
  { label: "Itch.io", href: "https://naman-jain.itch.io/", icon: siItchdotio.path },
  { label: "Email", href: "mailto:jainnaman027@gmail.com", icon: mailPath },
];

export const projects: Item[] = [
  {
    title: "Voice Note Interpreter — translate voice notes across 22 Indian languages",
    meta: "ai",
    href: "https://namanjain27.github.io/interpretor-indic/",
  },
  {
    title: "BFSI claim verifier — multi-agent claim resolution with human fallback",
    meta: "ai",
    href: "https://github.com/namanjain27/bfsi-copilot",
  },
  {
    title: "RestroPilot — AI reservation agents built from scratch",
    meta: "ai",
    href: "/restroPilot_Naman.pdf",
  },
  {
    title: "EchoPilot — AI customer support app + SDK",
    meta: "ai",
    href: "https://github.com/namanjain27/EchoPilot",
  },
  {
    title: "TrackX — personal finance app with an AI consultant",
    meta: "full-stack",
    href: "https://github.com/namanjain27/expense-tracker",
  },
  {
    title: "Territorial Attack — 2D multiplayer Android game, 800+ downloads",
    meta: "game",
    href: "https://studiocentauri.itch.io/territorial-attack",
  },
  {
    title: "Creep curve prediction — ML on data mined from research PDFs",
    meta: "research",
    href: "https://github.com/namanjain27/SURGE---Creep-plot-prediction/blob/main/2230766%20SURGE%20Endterm%20Report.pdf",
  },
];

export const experience: Item[] = [
  {
    title: "Forward Deployed Engineer",
    meta: "sarvam ai · bangalore",
    description:
      "The single point of contact for clients on everything technical. I go to the client, understand their problem, and build the complete solution they need end to end on top of Sarvam's platform, whether that means adapting existing templated products or building from scratch with Sarvam's APIs and stack. This spans conversational AI voice agents on Samvaad (complete conversational flows with edge cases handled, multi-state transitions, data capture and delivery to the client's server) as well as API integrations, service latency, custom call scheduling and retries, and Metabase analytics dashboards with custom metrics for real-time insights.",
  },
  {
    title: "Software Engineer",
    meta: "ingram micro · mumbai",
    description:
      "Built a robust cost update module for Vendors with cloud products, leveraging Java and Spring framework, PostgreSQL DBMS and Google Cloud Platform for storage. Devised a bulk data export feature using Google Cloud's BigQuery jobs and merge files using gsutil. Have used Elastic Search for fast search over billions of rows of data. Employed multi-threading techniques and asynchronous processing in the catalog ingestion process for vendors.",
  },
  {
    title: "Software Developer Intern (Received PPO)",
    meta: "ltimindtree · hyderabad",
    description:
      "Developed AI features for a chatbot used by BU heads for IP & patent management, using Microsoft Bot Framework SDK and Azure Cognitive AI services. Built a QnA generator in python that periodically extracts data from website into a structured dataset in tsv file. Employed Conversational Language Understanding model in MS Language Studio.",
  },
  {
    title: "Research Intern",
    meta: "surge iitk 2022 · kanpur",
    description:
      "Generated creep curve plots for α-β Titanium (Ti-6 Al-4) based high temperature alloys using mathematical models and ML techniques. Feature engineered 4 out of 7 variables through principal component analysis (PCA) and Pearson correlation. Tested multiple regression models to arrive at acceptable results.",
  },
];

export const campus: Item[] = [
  {
    title: "Co-Founder & UG Convener",
    meta: "matsoc, iit kanpur",
    description:
      "Co-Founded a 600+ member Departmental Society to engage & promote MSE research & technology awareness. Headed a team of 20+ & organized Orientation, Farewell, 6 alumni talks & workshops, Research Scholars' Day. Formulated an annual structure of events, project proposals, society's financial budgeting structure and rules.",
  },
  {
    title: "Coordinator",
    meta: "gamedev club, iit kanpur",
    description:
      "Leading a 3-tier team of 40+ members to foster Game Development by organizing game jams, workshops & projects. Mentored multiple specialized projects on Gamification, Augmented Reality & AI games using Unity Game Engine. Promoted GameDev, IITK stature from society to club in SnT Council, organized Bootcamp for 1200+ students with 4 workshops.",
  },
];
