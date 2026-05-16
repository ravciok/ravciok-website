import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { Footer } from "~/components/Footer";
import { Navbar } from "~/components/Navbar";
import { SITE } from "~/lib/site";
import "./app.css";

export default function App() {
  return (
    <Router
      explicitLinks
      root={(props) => (
        <MetaProvider>
          <Title>{SITE.name}</Title>
          <Meta property="og:site_name" content={SITE.name} />
          <Meta property="og:locale" content="en_US" />
          <Meta name="twitter:card" content="summary" />
          <Navbar />
          <Suspense>{props.children}</Suspense>
          <Footer />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
