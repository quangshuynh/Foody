import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RestaurantFormModal from './RestaurantFormModal';

jest.mock('./TagSelector', () => () => <div>Tags</div>);
jest.mock('react-toastify', () => ({ toast: { error: jest.fn() } }));

const renderForm = (props = {}) => {
  const defaults = { restaurantToEdit: null, onSubmit: jest.fn(), onClose: jest.fn(), listType: 'visited' };
  const result = { ...defaults, ...props };
  render(<RestaurantFormModal {...result} />);
  return result;
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test('geocodes an address and submits numeric coordinates', async () => {
  fetch.mockResolvedValue({ json: async () => [{ lat: '43.15', lon: '-77.61' }] });
  const { onSubmit, onClose } = renderForm();
  fireEvent.change(screen.getByPlaceholderText(/Restaurant Name/), { target: { value: 'Nosh' } });
  fireEvent.change(screen.getByPlaceholderText(/Street Address/), { target: { value: '100 Main St' } });

  fireEvent.click(screen.getByRole('button', { name: 'Add Restaurant' }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Nosh', address: '100 Main St', location: { lat: 43.15, lng: -77.61 },
  })));
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('100%20Main%20St'));
  expect(onClose).toHaveBeenCalled();
});

test('shows an error and does not submit when geocoding finds no address', async () => {
  fetch.mockResolvedValue({ json: async () => [] });
  const { onSubmit, onClose } = renderForm();
  fireEvent.change(screen.getByPlaceholderText(/Restaurant Name/), { target: { value: 'Unknown' } });
  fireEvent.change(screen.getByPlaceholderText(/Street Address/), { target: { value: 'Nowhere' } });

  fireEvent.click(screen.getByRole('button', { name: 'Add Restaurant' }));

  expect(await screen.findByText('Address not found. Please enter a valid address.')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});
