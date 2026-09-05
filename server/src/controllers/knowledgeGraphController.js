import Paper from "../models/Paper.js";

const createNodeId = (type, value) => {
  return `${type}-${String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")}`;
};

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
      "_id filename title authors tags topic abstract"
    );

    const nodes = [];
    const edges = [];

    const nodeIds = new Set();
    const edgeIds = new Set();

    const addNode = (node) => {
      if (!nodeIds.has(node.id)) {
        nodes.push(node);
        nodeIds.add(node.id);
      }
    };

    const addEdge = (
      source,
      target,
      relationship,
      metadata = {}
    ) => {
      const edgeId = `${source}-${relationship}-${target}`;

      if (edgeIds.has(edgeId)) {
        return;
      }

      edges.push({
        id: edgeId,
        source,
        target,
        relationship,
        ...metadata,
      });

      edgeIds.add(edgeId);
    };

    // -----------------------------------
    // CREATE PAPER / TOPIC / AUTHOR / TAG
    // NODES
    // -----------------------------------

    for (const paper of papers) {
      const paperNodeId = `paper-${paper._id}`;

      addNode({
        id: paperNodeId,
        type: "paper",
        label: paper.title || paper.filename,
        data: {
          paperId: paper._id,
          title: paper.title || paper.filename,
          filename: paper.filename,
          abstract: paper.abstract || "",
          topic: paper.topic || "",
          authors: paper.authors || [],
          tags: paper.tags || [],
        },
      });

      // TOPIC

      if (paper.topic?.trim()) {
        const topicNodeId = createNodeId(
          "topic",
          paper.topic
        );

        addNode({
          id: topicNodeId,
          type: "topic",
          label: paper.topic.trim(),
          data: {
            topic: paper.topic.trim(),
          },
        });

        addEdge(
          paperNodeId,
          topicNodeId,
          "BELONGS_TO"
        );
      }

      // AUTHORS

      for (const author of paper.authors || []) {
        if (!author?.trim()) continue;

        const authorNodeId = createNodeId(
          "author",
          author
        );

        addNode({
          id: authorNodeId,
          type: "author",
          label: author.trim(),
          data: {
            name: author.trim(),
          },
        });

        addEdge(
          paperNodeId,
          authorNodeId,
          "AUTHORED_BY"
        );
      }

      // TAGS

      for (const tag of paper.tags || []) {
        if (!tag?.trim()) continue;

        const tagNodeId = createNodeId(
          "tag",
          tag
        );

        addNode({
          id: tagNodeId,
          type: "tag",
          label: tag.trim(),
          data: {
            tag: tag.trim(),
          },
        });

        addEdge(
          paperNodeId,
          tagNodeId,
          "HAS_CONCEPT"
        );
      }
    }

    // -----------------------------------
    // CONNECT PAPERS
    // -----------------------------------

    for (let i = 0; i < papers.length; i++) {
      for (
        let j = i + 1;
        j < papers.length;
        j++
      ) {
        const paperA = papers[i];
        const paperB = papers[j];

        const sharedTopics =
          paperA.topic &&
          paperB.topic &&
          paperA.topic
            .trim()
            .toLowerCase() ===
            paperB.topic
              .trim()
              .toLowerCase();

        const tagsA = new Set(
          (paperA.tags || []).map((tag) =>
            tag.trim().toLowerCase()
          )
        );

        const sharedTags = (
          paperB.tags || []
        ).filter((tag) =>
          tagsA.has(
            tag.trim().toLowerCase()
          )
        );

        const sharedAuthors =
          (paperA.authors || []).filter(
            (author) =>
              (paperB.authors || [])
                .map((a) =>
                  a.trim().toLowerCase()
                )
                .includes(
                  author.trim().toLowerCase()
                )
          );

        const reasons = [];

        if (sharedTopics) {
          reasons.push("Same research topic");
        }

        if (sharedTags.length > 0) {
          reasons.push(
            `Shared concepts: ${sharedTags.join(", ")}`
          );
        }

        if (sharedAuthors.length > 0) {
          reasons.push("Shared author");
        }

        if (reasons.length > 0) {
          addEdge(
            `paper-${paperA._id}`,
            `paper-${paperB._id}`,
            "RELATED_RESEARCH",
            {
              reasons,
              sharedTags,
              sharedAuthors,
              sameTopic: Boolean(sharedTopics),
            }
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
      message:
        "Failed to generate knowledge graph",
    });
  }
};