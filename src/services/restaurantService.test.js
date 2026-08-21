import { addDoc, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { logAuditEvent } from './auditLogService';
import {
  addRestaurant,
  fetchVisitedRestaurants,
  removeRestaurant,
  updateRestaurant,
} from './restaurantService';

jest.mock('../firebaseConfig', () => ({ db: {}, auth: { currentUser: null } }));
jest.mock('./auditLogService', () => ({ logAuditEvent: jest.fn() }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'visited-collection'),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn((db, collectionName, id) => `${collectionName}/${id}`),
  serverTimestamp: jest.fn(() => 'server-timestamp'),
}));

beforeEach(() => {
  jest.clearAllMocks();
  doc.mockImplementation((db, collectionName, id) => `${collectionName}/${id}`);
  serverTimestamp.mockReturnValue('server-timestamp');
  auth.currentUser = { uid: 'user-1', email: 'foodie@example.com' };
});

test('fetches visited restaurants newest first and normalizes Firestore dates', async () => {
  getDocs.mockResolvedValue({
    docs: [
      { id: 'old', data: () => ({ name: 'Old Place', dateAdded: { toDate: () => new Date('2024-01-01') } }) },
      { id: 'new', data: () => ({ name: 'New Place', dateAdded: { toDate: () => new Date('2025-01-01') } }) },
    ],
  });

  const restaurants = await fetchVisitedRestaurants();

  expect(restaurants.map(({ id }) => id)).toEqual(['new', 'old']);
  expect(restaurants[0].dateAdded).toBe('2025-01-01T00:00:00.000Z');
});

test('returns an empty visited list when Firestore cannot be read', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  getDocs.mockRejectedValue(new Error('offline'));

  await expect(fetchVisitedRestaurants()).resolves.toEqual([]);
});

test('adds an authenticated restaurant with persistence defaults and an audit event', async () => {
  addDoc.mockResolvedValue({ id: 'restaurant-1' });

  const saved = await addRestaurant({ name: 'Nosh', address: '1 Main St' });

  expect(addDoc).toHaveBeenCalledWith('visited-collection', expect.objectContaining({
    name: 'Nosh', userId: 'user-1', ratings: [], averageRating: 0, tags: {}, dateAdded: 'server-timestamp',
  }));
  expect(logAuditEvent).toHaveBeenCalledWith('CREATE', 'visitedRestaurants', 'restaurant-1', {
    name: 'Nosh', address: '1 Main St',
  });
  expect(saved).toEqual(expect.objectContaining({ id: 'restaurant-1', userId: 'user-1' }));
});

test('updates a restaurant without writing its document id', async () => {
  await updateRestaurant({ id: 'restaurant-1', name: 'Renamed' });

  expect(updateDoc).toHaveBeenCalledWith('visitedRestaurants/restaurant-1', {
    name: 'Renamed', tags: {}, updatedAt: 'server-timestamp',
  });
  expect(logAuditEvent).toHaveBeenCalledWith(
    'UPDATE', 'visitedRestaurants', 'restaurant-1', expect.any(Object)
  );
});

test('rejects unauthenticated deletion before calling Firestore', async () => {
  auth.currentUser = null;

  await expect(removeRestaurant('restaurant-1')).rejects.toThrow('Authentication required');
  expect(deleteDoc).not.toHaveBeenCalled();
});
