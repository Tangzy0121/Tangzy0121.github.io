export type PostSection = { heading?: string; paragraphs: string[]; quote?: string };
export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  category: string;
  sections: PostSection[];
};

export const posts: Post[] = [
  {
    slug: "hello-world",
    title: "Hello, world.",
    description: "Why this blog exists, and what I want to leave here over time.",
    date: "Aug 26, 2026",
    readingTime: "2 min read",
    category: "Notes",
    sections: [
      {
        paragraphs: [
          "I built this small corner of the web to keep the things I genuinely learn: programming-contest ideas, course notes, experiments, and the occasional thought worth returning to.",
          "It is not meant to make my GitHub look busier. The useful part comes first; the presentation follows.",
        ],
        quote: "Real learning → real accumulation → systematic notes → something worth sharing.",
      },
      {
        heading: "What will appear here",
        paragraphs: [
          "Most entries will begin with problems I have actually encountered. Some may become polished explanations; others will stay as concise field notes.",
          "For now, the direction is simple: algorithms, data science, computer science, and whatever I find interesting along the way.",
        ],
      },
    ],
  },
];

export function getPost(slug: string) { return posts.find((post) => post.slug === slug); }
