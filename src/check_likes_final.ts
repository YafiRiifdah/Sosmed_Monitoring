import { prisma } from "./database/prisma.js";

async function main() {
  const post = await prisma.instagramPost.findUnique({
    where: { instagramPostId: "CsdVI7qhOf-" },
    include: {
      statuses: {
        include: { monitoredAccount: true }
      },
      engagements: true
    }
  });
  console.log(JSON.stringify(post, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
