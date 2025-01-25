"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
class SearchService {
    constructor() {
        this.client = new elasticsearch_1.Client({
            node: process.env.ELASTICSEARCH_URL,
        });
    }
    buildFilters(filters) {
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
    async searchTickets(query, filters = {}) {
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
exports.SearchService = SearchService;
