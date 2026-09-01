import Paper from "../models/Paper.js";

export const getKnowledgeGraph = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    const filter = {
      uploadedBy: req.user.id,
    };

    if (workspaceId) {
      filter.workspace = workspaceId;
    }

    const papers = await Paper.find(filter).select(
      "_id filename title authors tags topic workspace abstract"
    );

    const nodes = [];
    const edges = [];

    const nodeMap = new Map();

    const addNode = (id, type, label, data = {}) => {
      if (nodeMap.has(id)) {
        return;
      }

      const node = {
        id,
        type,
        label,
        data,
      };

      nodeMap.set(id, node);
      nodes.push(node);
    };

    const addEdge = (source, target, relationship) => {
      edges.push({
        id: `${source}-${relationship}-${target}`,
        source,
        target,
        relationship,
      });
    };

    for (const paper of papers) {
      const paperId = `paper-${paper._id}`;

      addNode(
        paperId,
        "paper",
        paper.title || paper.filename,
        {
          paperId: paper._id,
          filename: paper.filename,
          authors: paper.authors || [],
          topic: paper.topic || "Research",
          tags: paper.tags || [],
          abstract: paper.abstract || "",
        }
      );

      // -------------------------
      // AUTHORS
      // -------------------------

      for (const author of paper.authors || []) {
        if (!author?.trim()) continue;

        const authorId = `author-${author
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`;

        addNode(
          authorId,
          "author",
          author.trim(),
          {
            name: author.trim(),
          }
        );

        addEdge(
          paperId,
          authorId,
          "AUTHORED_BY"
        );
      }

      // -------------------------
      // TOPIC
      // -------------------------

      if (paper.topic?.trim()) {
        const topicId = `topic-${paper.topic
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`;

        addNode(
          topicId,
          "topic",
          paper.topic.trim(),
          {
            topic: paper.topic.trim(),
          }
        );

        addEdge(
          paperId,
          topicId,
          "BELONGS_TO"
        );
      }

      // -------------------------
      // TAGS
      // -------------------------

      for (const tag of paper.tags || []) {
        if (!tag?.trim()) continue;

        const tagId = `tag-${tag
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`;

        addNode(
          tagId,
          "tag",
          tag.trim(),
          {
            tag: tag.trim(),
          }
        );

        addEdge(
          paperId,
          tagId,
          "TAGGED_WITH"
        );
      }
    }

    // -------------------------
    // CONNECT PAPERS SHARING
    // TOPICS OR TAGS
    // -------------------------

    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        const paperA = papers[i];
        const paperB = papers[j];

        const topicMatch =
          paperA.topic &&
          paperB.topic &&
          paperA.topic.toLowerCase() ===
            paperB.topic.toLowerCase();

        const tagsA = new Set(
          (paperA.tags || []).map((tag) =>
            tag.toLowerCase()
          )
        );

        const sharedTags = (paperB.tags || []).filter(
          (tag) =>
            tagsA.has(tag.toLowerCase())
        );

        if (topicMatch || sharedTags.length > 0) {
          addEdge(
            `paper-${paperA._id}`,
            `paper-${paperB._id}`,
            "RELATED_RESEARCH"
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      graph: {
        nodes,
        edges,
      },
    });
  } catch (error) {
    console.error(
      "Knowledge graph error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate knowledge graph",
    });
  }
};