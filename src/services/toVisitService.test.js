import { addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { logAuditEvent } from './auditLogService';
import { addToVisit, removeToVisit } from './toVisitService';

jest.mock('../firebaseConfig', () => ({ db: {}, auth: { currentUser: null } }));
jest.mock('./auditLogService', () => ({ logAuditEvent: jest.fn() }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'to-visit-collection'),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn((db, collectionName, id) => `${collectionName}/${id}`),
  Timestamp: { fromDate: jest.fn(() => 'firestore-date') },
}));

beforeEach(() => {
  jest.clearAllMocks();
  doc.mockImplementation((db, collectionName, id) => `${collectionName}/${id}`);
  Timestamp.fromDate.mockReturnValue('firestore-date');
  auth.currentUser = { uid: 'user-1' };
});

test('requires both a name and address before adding to the visit list', async () => {
  await expect(addToVisit({ name: 'Somewhere' })).rejects.toThrow(
    'Restaurant name and address are required.'
  );
  expect(addDoc).not.toHaveBeenCalled();
});

test('adds a restaurant to the visit list without carrying a temporary id', async () => {
  addDoc.mockResolvedValue({ id: 'saved-id' });

  const saved = await addToVisit({ id: 'temporary', name: 'Try Me', address: '2 Main St' });

  expect(Timestamp.fromDate).toHaveBeenCalledWith(expect.any(Date));
  expect(addDoc).toHaveBeenCalledWith('to-visit-collection', {
    name: 'Try Me', address: '2 Main St', userId: 'user-1', dateAdded: 'firestore-date', tags: {},
  });
  expect(saved.id).toBe('saved-id');
  expect(logAuditEvent).toHaveBeenCalledWith('CREATE', 'toVisitRestaurants', 'saved-id', expect.any(Object));
});

test('removes a visit-list restaurant and records the deletion', async () => {
  await expect(removeToVisit('visit-1')).resolves.toBe(true);

  expect(deleteDoc).toHaveBeenCalledWith('toVisitRestaurants/visit-1');
  expect(logAuditEvent).toHaveBeenCalledWith('DELETE', 'toVisitRestaurants', 'visit-1');
});
