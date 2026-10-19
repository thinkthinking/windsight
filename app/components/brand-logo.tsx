import Openai from "@zenmux/icons/Openai";
import Claude from "@zenmux/icons/Claude";
import Deepseek from "@zenmux/icons/Deepseek";
import Qwen from "@zenmux/icons/Qwen";
import Mistral from "@zenmux/icons/Mistral";
import Gemini from "@zenmux/icons/Gemini";
import Meta from "@zenmux/icons/Meta";
import Grok from "@zenmux/icons/Grok";

/** Per-brand imports keep the catalog out of the client bundle. */
export function BrandLogo({
  name,
  company = "",
  size = 22,
}: {
  name: string;
  company?: string;
  size?: number;
}) {
  const label = `${name} ${company}`.toLowerCase();
  const Brand = /openai|gpt|chatgpt/.test(label)
    ? Openai
    : /anthropic|claude/.test(label)
      ? Claude
      : /deepseek/.test(label)
        ? Deepseek
        : /qwen|阿里|通义/.test(label)
          ? Qwen
          : /mistral/.test(label)
            ? Mistral
            : /gemini|google|deepmind/.test(label)
              ? Gemini
              : /llama|meta/.test(label)
                ? Meta
                : /grok|xai|x\.ai/.test(label)
                  ? Grok
                  : null;
  return Brand ? (
    <Brand.Color size={size} />
  ) : (
    <span
      aria-hidden="true"
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
        fontSize: Math.round(size * 0.7),
        fontWeight: 600,
        color: "#7186a4",
      }}
    >
      {name.slice(0, 1)}
    </span>
  );
}
