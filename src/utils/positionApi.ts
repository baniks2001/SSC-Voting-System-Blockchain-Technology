// src/utils/positionApi.ts
import { api } from './api';
import { Position, PositionFormData } from '../types';

export const positionApi = {
  // Get all positions
  getPositions: async (): Promise<Position[]> => {
    const response = await api.get('/positions');
    return response.map((position: any) => ({
      id: position.id,
      name: position.name,
      maxVotes: position.max_votes,
      order: position.display_order,
      is_active: position.is_active,
      created_at: position.created_at,
      updated_at: position.updated_at
    }));
  },

  // Get active positions
  getActivePositions: async (): Promise<Position[]> => {
    const response = await api.get('/positions/active');
    return response.map((position: any) => ({
      id: position.id,
      name: position.name,
      maxVotes: position.max_votes,
      order: position.display_order,
      is_active: position.is_active,
      created_at: position.created_at,
      updated_at: position.updated_at
    }));
  },

  // Create a new position
  createPosition: async (positionData: PositionFormData): Promise<Position> => {
    const response = await api.post('/positions', positionData);
    return {
      id: response.id,
      name: response.name,
      maxVotes: response.max_votes,
      order: response.display_order,
      is_active: response.is_active,
      created_at: response.created_at,
      updated_at: response.updated_at
    };
  },

  // Update a position
  updatePosition: async (id: number, positionData: PositionFormData): Promise<Position> => {
    const response = await api.put(`/positions/${id}`, positionData);
    return {
      id: response.id,
      name: response.name,
      maxVotes: response.max_votes,
      order: response.display_order,
      is_active: response.is_active,
      created_at: response.created_at,
      updated_at: response.updated_at
    };
  },

  // Delete a position
  deletePosition: async (id: number): Promise<void> => {
    return await api.delete(`/positions/${id}`);
  },

  // Get position by ID
  getPositionById: async (id: number): Promise<Position> => {
    const response = await api.get(`/positions/${id}`);
    return {
      id: response.id,
      name: response.name,
      maxVotes: response.max_votes,
      order: response.display_order,
      is_active: response.is_active,
      created_at: response.created_at,
      updated_at: response.updated_at
    };
  }
};