import { Client } from "@elastic/elasticsearch";

export class SearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL,
    });
  }

  private buildFilters(filters: any) {
    const filterClauses = [];

    if (filters.status) {
      filterClauses.push({
        term: { status: filters.status },
      });
    }

    if (filters.priority) {
      filterClauses.push({
        term: { priority: filters.priority },
      });
    }

    if (filters.teamId) {
      filterClauses.push({
        term: { "team.id": filters.teamId },
      });
    }

    if (filters.assignedToId) {
      filterClauses.push({
        term: { "assignedTo.id": filters.assignedToId },
      });
    }

    return filterClauses;
  }

  async searchTickets(query: string, filters: any = {}) {
    const response = await this.client.search({
      index: "tickets",
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ["title^2", "description", "comments.content"],
                },
              },
              ...this.buildFilters(filters),
            ],
          },
        },
        highlight: {
          fields: {
            title: {},
            description: {},
            "comments.content": {},
          },
        },
      },
    });

    return response.hits.hits;
  }
}
