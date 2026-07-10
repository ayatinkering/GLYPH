"use server";

import { supabase } from "@/lib/supabase";

interface CommitParams {
  svgContent: string;
  jsonContent: string;
  commitNumber: number;
  solarPeriod: string;
  seed: string;
}

export async function githubCommit({
  svgContent,
  jsonContent,
  commitNumber,
  solarPeriod,
  seed,
}: CommitParams) {
  // 1. Get the current user session from Supabase on the server
  const { data: { session }, error } = await supabase.auth.getSession();
  
  const formattedNum = commitNumber.toString().padStart(4, "0");
  const svgPath = `commits/MC-${formattedNum}.svg`;
  const jsonPath = `commits/MC-${formattedNum}.json`;
  const commitMsg = `Preserve walk Mandala Commit #${formattedNum} [${solarPeriod}]`;

  // Offline Simulation fallback if keys or oauth session is missing
  if (error || !session || !session.provider_token) {
    console.warn("GLYPH Server Action: GitHub token missing. Executing simulation commit.");
    
    // Simulate API delay for visual spinner feedback
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      success: true,
      simulated: true,
      message: `Simulated push: Successfully committed MC-${formattedNum} to glyph-walks repository.`,
    };
  }

  const token = session.provider_token;
  const username = session.user?.user_metadata?.user_name || "user";

  try {
    // 2. Check if repository 'glyph-walks' exists
    const repoCheckRes = await fetch(
      `https://api.github.com/repos/${username}/glyph-walks`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (repoCheckRes.status === 404) {
      // 3. Create repository 'glyph-walks'
      console.log(`GLYPH: Creating repository 'glyph-walks' for user '${username}'`);
      const createRepoRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          name: "glyph-walks",
          description: "Every walk becomes a deterministic mathematical mandala — generated from my footsteps, shaped by the sky, committed to GitHub.",
          private: false,
          has_issues: false,
          has_projects: false,
          has_wiki: false,
          auto_init: true, // Auto-initialize with a README
        }),
      });

      if (!createRepoRes.ok) {
        throw new Error(`Failed to create repository: ${createRepoRes.statusText}`);
      }

      // Wait 1.5 seconds for GitHub initialization to complete
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // 4. Commit files programmatically using PUT contents endpoint
    // We will push both the SVG graphic and JSON Walk DNA
    const svgBase64 = Buffer.from(svgContent).toString("base64");
    const jsonBase64 = Buffer.from(jsonContent).toString("base64");

    const pushFile = async (path: string, content: string) => {
      const res = await fetch(
        `https://api.github.com/repos/${username}/glyph-walks/contents/${path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            message: commitMsg,
            content: content,
          }),
        }
      );
      return res;
    };

    const pushSvgRes = await pushFile(svgPath, svgBase64);
    const pushJsonRes = await pushFile(jsonPath, jsonBase64);

    if (!pushSvgRes.ok || !pushJsonRes.ok) {
      throw new Error("Failed to write contents to GitHub repository.");
    }

    return {
      success: true,
      simulated: false,
      message: `Mandala Commit #${formattedNum} successfully pushed to ${username}/glyph-walks.`,
    };
  } catch (err: any) {
    console.error("GLYPH GitHub Engine error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred during commit.",
    };
  }
}
