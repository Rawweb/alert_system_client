import { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../hooks/useProducts';
import RiskBadge from '../../components/ui/RiskBadge';
import Modal from '../../components/ui/Modal';

// The four sectors from section 1.5 of the document
const CATEGORIES = [
  'Food and Beverages',
  'Pharmaceuticals and Medications',
  'Cosmetics and Personal Care',
  'Household and Chemical Products',
];

// Empty form shape used when opening the create modal
const EMPTY_FORM = {
  name: '',
  category: '',
  manufacturer: '',
  batchNumber: '',
  manufacturingDate: '',
  expiryDate: '',
  quantity: '',
  storageLocation: '',
};

// Converts a MongoDB ISO date string into a value that works
// inside an <input type="date"> field: "2026-07-30"
const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// Readable date: "30 Jul 2026"
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const Products = () => {
  // ---- UI state ----
  // modal can be null (closed), 'create', 'edit', or 'delete'
  const [modal, setModal] = useState(null);
  const [selectedProduct, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategory] = useState('');

  // ---- Server data ----
  const { data, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const allProducts = data?.products || [];

  // Filter happens client-side so the response count is always right
  const filtered = allProducts.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(search.toLowerCase());

    const matchCategory = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // ---- Modal openers ----
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSelected(null);
    setModal('create');
  };

  const openEdit = (product) => {
    setSelected(product);
    setForm({
      name: product.name,
      category: product.category,
      manufacturer: product.manufacturer,
      batchNumber: product.batchNumber,
      manufacturingDate: toInputDate(product.manufacturingDate),
      expiryDate: toInputDate(product.expiryDate),
      quantity: product.quantity,
      storageLocation: product.storageLocation,
    });
    setModal('edit');
  };

  const openDelete = (product) => {
    setSelected(product);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(EMPTY_FORM);
  };

  // ---- Form helpers ----
  // One handler for every input: reads e.target.name to know which
  // field changed, keeps the rest intact via the spread operator.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const required = [
      'name',
      'category',
      'manufacturer',
      'batchNumber',
      'manufacturingDate',
      'expiryDate',
      'storageLocation',
    ];
    for (const field of required) {
      if (!form[field]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1')} is required`);
        return false;
      }
    }
    if (form.quantity === '' || Number(form.quantity) < 0) {
      toast.error('Quantity is required and cannot be negative');
      return false;
    }
    if (new Date(form.expiryDate) <= new Date(form.manufacturingDate)) {
      toast.error('Expiry date must be after the manufacturing date');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...form, quantity: Number(form.quantity) };

    if (modal === 'create') {
      createProduct.mutate(payload, { onSuccess: closeModal });
    } else {
      updateProduct.mutate(
        { id: selectedProduct._id, data: payload },
        { onSuccess: closeModal },
      );
    }
  };

  const handleDelete = () => {
    deleteProduct.mutate(selectedProduct._id, { onSuccess: closeModal });
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  // ---- Render ----
  return (
    <div className='space-y-5'>
      {/* ── Top bar ── */}
      <div
        className='flex flex-col sm:flex-row sm:items-center
                      justify-between gap-3'
      >
        <div>
          <h2 className='text-xl font-bold text-text-heading'>Products</h2>
          <p className='text-sm text-text-muted mt-0.5'>
            {filtered.length} of {allProducts.length} product(s)
          </p>
        </div>
        <button
          onClick={openCreate}
          className='btn flex items-center gap-2 sm:w-auto'
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* ── Filters ── */}
      <div className='flex flex-col sm:flex-row gap-3'>
        {/* Search input with magnifier icon inside */}
        <div className='relative flex-1'>
          <Search
            size={15}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-text-muted'
          />
          <input
            type='text'
            placeholder='Search by name, batch number, or manufacturer...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='input pl-9'
          />
        </div>

        {/* Category dropdown filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategory(e.target.value)}
          className='input sm:w-60'
        >
          <option value=''>All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className='card overflow-hidden'>
        {/* overflow-x-auto lets the table scroll horizontally on mobile */}
        <div className='overflow-x-auto thin-scrollbar'>
          <table className='w-full text-sm min-w-[900px]'>
            <thead>
              <tr className='border-b border-border bg-bg'>
                {[
                  'Product',
                  'Category',
                  'Manufacturer',
                  'Mfg Date',
                  'Expiry Date',
                  'Qty',
                  'Location',
                  'Status',
                  '',
                ].map((col) => (
                  <th
                    key={col}
                    className='text-left px-4 py-3 text-xs font-semibold
                               text-text-muted uppercase tracking-wide
                               whitespace-nowrap'
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className='divide-y divide-border'>
              {isLoading ? (
                // Skeleton rows while data is loading
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className='px-4 py-3'>
                        <div className='h-4 bg-hover rounded animate-pulse' />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className='px-4 py-14 text-center
                                             text-text-muted'
                  >
                    {search || categoryFilter
                      ? 'No products match your search or filter.'
                      : 'No products yet. Click Add Product to register your first one.'}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={product._id}
                    className='hover:bg-hover transition-colors'
                  >
                    {/* Product name + batch number stacked */}
                    <td className='px-4 py-3'>
                      <p className='font-medium text-text-heading'>
                        {product.name}
                      </p>
                      <p className='text-xs text-text-muted mt-0.5'>
                        Batch: {product.batchNumber}
                      </p>
                    </td>

                    <td className='px-4 py-3 text-text whitespace-nowrap'>
                      {product.category}
                    </td>

                    <td className='px-4 py-3 text-text whitespace-nowrap'>
                      {product.manufacturer}
                    </td>

                    <td className='px-4 py-3 text-text whitespace-nowrap'>
                      {formatDate(product.manufacturingDate)}
                    </td>

                    <td className='px-4 py-3 text-text whitespace-nowrap'>
                      {formatDate(product.expiryDate)}
                    </td>

                    <td className='px-4 py-3 text-text'>{product.quantity}</td>

                    <td className='px-4 py-3 text-text whitespace-nowrap'>
                      {product.storageLocation}
                    </td>

                    <td className='px-4 py-3'>
                      <RiskBadge status={product.riskStatus} />
                    </td>

                    {/* Action buttons */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() => openEdit(product)}
                          className='p-1.5 rounded-lg text-text-muted
                                     hover:bg-hover hover:text-text-heading
                                     transition-colors'
                          title='Edit product'
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => openDelete(product)}
                          className='p-1.5 rounded-lg text-text-muted
                                     hover:bg-danger/10 hover:text-danger
                                     transition-colors'
                          title='Delete product'
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modal === 'create' || modal === 'edit'}
        onClose={closeModal}
        title={modal === 'create' ? 'Add New Product' : 'Edit Product'}
        size='lg'
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Name + Category */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>
                Product Name
              </label>
              <input
                type='text'
                name='name'
                value={form.name}
                onChange={handleChange}
                placeholder='e.g. Emzor Paracetamol 500mg'
                className='input'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>
                Category
              </label>
              <select
                name='category'
                value={form.category}
                onChange={handleChange}
                className='input'
              >
                <option value=''>Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Manufacturer + Batch Number */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>
                Manufacturer
              </label>
              <input
                type='text'
                name='manufacturer'
                value={form.manufacturer}
                onChange={handleChange}
                placeholder='e.g. Emzor Pharmaceutical'
                className='input'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>
                Batch Number
              </label>
              <input
                type='text'
                name='batchNumber'
                value={form.batchNumber}
                onChange={handleChange}
                placeholder='e.g. EMZ24070118'
                className='input'
              />
            </div>
          </div>

          {/* Manufacturing Date + Expiry Date */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>
                Manufacturing Date
              </label>
              <input
                type='date'
                name='manufacturingDate'
                value={form.manufacturingDate}
                onChange={handleChange}
                className='input'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>
                Expiry Date
              </label>
              <input
                type='date'
                name='expiryDate'
                value={form.expiryDate}
                onChange={handleChange}
                className='input'
              />
            </div>
          </div>

          {/* Quantity + Storage Location */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>
                Quantity
              </label>
              <input
                type='number'
                name='quantity'
                value={form.quantity}
                onChange={handleChange}
                placeholder='0'
                min='0'
                className='input'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>
                Storage Location
              </label>
              <input
                type='text'
                name='storageLocation'
                value={form.storageLocation}
                onChange={handleChange}
                placeholder='e.g. Shelf A1'
                className='input'
              />
            </div>
          </div>

          {/* Form action buttons */}
          <div className='flex justify-end gap-3 pt-2 border-t border-border'>
            <button
              type='button'
              onClick={closeModal}
              className='px-4 py-2.5 rounded-lg border border-border
                         text-text text-sm font-medium hover:bg-hover
                         transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='btn sm:w-auto'
            >
              {isSubmitting
                ? 'Saving...'
                : modal === 'create'
                  ? 'Add Product'
                  : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        isOpen={modal === 'delete'}
        onClose={closeModal}
        title='Delete Product'
        size='sm'
      >
        <div className='space-y-4'>
          <p className='text-sm text-text'>
            Are you sure you want to delete{' '}
            <span className='font-semibold text-text-heading'>
              {selectedProduct?.name}
            </span>{' '}
            (Batch: {selectedProduct?.batchNumber})? This cannot be undone.
          </p>

          <div className='flex justify-end gap-3 pt-2 border-t border-border'>
            <button
              type='button'
              onClick={closeModal}
              className='px-4 py-2.5 rounded-lg border border-border
                         text-text text-sm font-medium hover:bg-hover
                         transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className='px-4 py-2.5 rounded-lg bg-danger text-white
                         text-sm font-medium hover:opacity-90
                         disabled:opacity-50 transition-opacity'
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
