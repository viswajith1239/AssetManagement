import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Save, 
  Send, 
  RotateCcw, 
  X, 
  Plus, 
  Trash2,
  Download,
  Upload,
  ArrowLeft
} from 'lucide-react';
import { grnsAPI, vendorsAPI, branchesAPI, assetSubcategoriesAPI } from '../../services/api';

const GRNForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      grnDate: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      vendorId: '',
      branchId: '',
      status: 'draft',
      remarks: '',
      lineItems: [
        {
          subcategoryId: '',
          itemDescription: '',
          quantity: 1,
          unitPrice: 0,
          taxPercent: 0,
          taxableValue: 0,
          totalAmount: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

 
  const watchedLineItems = watch('lineItems');


  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [vendorsRes, branchesRes, subcategoriesRes] = await Promise.all([
          vendorsAPI.getAll({ limit: 1000 }),
          branchesAPI.getAll({ limit: 1000 }),
          assetSubcategoriesAPI.getAll({ limit: 1000 }),
        ]);

        setVendors(vendorsRes.data.data || []);
        setBranches(branchesRes.data.data || []);
        setSubcategories(subcategoriesRes.data.data || []);
      } catch (error) {
        toast.error('Error fetching master data');
        console.error('Error fetching master data:', error);
      }
    };

    fetchMasterData();
  }, []);


  useEffect(() => {
    if (id && id !== 'new') {
      setIsEdit(true);
      const fetchGRN = async () => {
        try {
          setLoading(true);
          const response = await grnsAPI.getById(id);
          const grn = response.data.data;
          
          reset({
            grnDate: grn.grnDate.split('T')[0],
            invoiceNumber: grn.invoiceNumber,
            vendorId: grn.vendorId._id,
            branchId: grn.branchId._id,
            status: grn.status,
            remarks: grn.remarks || '',
            lineItems: grn.lineItems.map(item => ({
              subcategoryId: item.subcategoryId._id,
              itemDescription: item.itemDescription,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxPercent: item.taxPercent,
              taxableValue: item.taxableValue,
              totalAmount: item.totalAmount,
            })),
          });
        } catch (error) {
          toast.error('Error fetching GRN data');
          console.error('Error fetching GRN:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchGRN();
    }
  }, [id, reset]);


  useEffect(() => {
    watchedLineItems.forEach((item, index) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const taxPercent = parseFloat(item.taxPercent) || 0;
      
      const taxableValue = quantity * unitPrice;
      const totalAmount = taxableValue + (taxableValue * taxPercent / 100);
      
      setValue(`lineItems.${index}.taxableValue`, taxableValue);
      setValue(`lineItems.${index}.totalAmount`, totalAmount);
    });
  }, [watchedLineItems, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      if (isEdit) {
        await grnsAPI.update(id, data);
        toast.success('GRN updated successfully');
      } else {
        await grnsAPI.create(data);
        toast.success('GRN created successfully');
      }
      
      navigate('/grns');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving GRN');
      console.error('Error saving GRN:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handleSubmitGRN = async () => {
    setValue('status', 'submitted');
    handleSubmit(onSubmit)();
  };

  const handleReset = () => {
    reset();
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
        navigate('/grns');
      }
    } else {
      navigate('/grns');
    }
  };

  const addLineItem = () => {
    append({
      subcategoryId: '',
      itemDescription: '',
      quantity: 1,
      unitPrice: 0,
      taxPercent: 0,
      taxableValue: 0,
      totalAmount: 0,
    });
  };

  const removeLineItem = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

 
  const totals = watchedLineItems.reduce(
    (acc, item) => {
      acc.subtotal += parseFloat(item.taxableValue) || 0;
      acc.totalTax += (parseFloat(item.taxableValue) || 0) * (parseFloat(item.taxPercent) || 0) / 100;
      return acc;
    },
    { subtotal: 0, totalTax: 0 }
  );

  const grandTotal = totals.subtotal + totals.totalTax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  from-amber-400 to-amber-600 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/grns')}
              className="bg-white text-amber-600 hover:bg-indigo-50 p-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {isEdit ? 'Edit GRN' : 'Create New GRN'}
              </h1>
              <p className="mt-1 text-indigo-100">
                {isEdit ? 'Update the Goods Received Note details' : 'Create a new Goods Received Note'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">GRN Header</h2>
              <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-semibold">
                {isEdit ? `GRN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-001` : 'Auto-generated'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GRN Date *
                </label>
                <input
                  type="date"
                  {...register('grnDate', { required: 'GRN date is required' })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400 ${
                    errors.grnDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.grnDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.grnDate.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  {...register('invoiceNumber', { 
                    required: 'Invoice number is required',
                    maxLength: { value: 30, message: 'Invoice number cannot exceed 30 characters' }
                  })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400 ${
                    errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter invoice number"
                />
                {errors.invoiceNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendor *
                </label>
                <select
                  {...register('vendorId', { required: 'Vendor is required' })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400 ${
                    errors.vendorId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                {errors.vendorId && (
                  <p className="mt-1 text-sm text-red-600">{errors.vendorId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch *
                </label>
                <select
                  {...register('branchId', { required: 'Branch is required' })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400 ${
                    errors.branchId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} - {branch.location}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <p className="mt-1 text-sm text-red-600">{errors.branchId.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  {...register('remarks')}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400"
                  placeholder="Enter any additional remarks"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-indigo-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-indigo-900">Line Items</h2>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="bg-amber-600 text-white  px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Row
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-12">#</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sub-Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-24">Qty</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">Unit Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-24">Tax %</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">Taxable Value</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">Total Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-indigo-25 transition-colors">
                      <td className="px-6 py-4 text-center font-medium text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <select
                          {...register(`lineItems.${index}.subcategoryId`, { 
                            required: 'Sub-category is required' 
                          })}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                            errors.lineItems?.[index]?.subcategoryId ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select sub-category</option>
                          {subcategories.map((subcategory) => (
                            <option key={subcategory._id} value={subcategory._id}>
                              {subcategory.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          {...register(`lineItems.${index}.itemDescription`, { 
                            required: 'Item description is required',
                            maxLength: { value: 100, message: 'Description cannot exceed 100 characters' }
                          })}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                            errors.lineItems?.[index]?.itemDescription ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter item description"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          {...register(`lineItems.${index}.quantity`, { 
                            required: 'Quantity is required',
                            min: { value: 1, message: 'Quantity must be at least 1' }
                          })}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                            errors.lineItems?.[index]?.quantity ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="1"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`lineItems.${index}.unitPrice`, { 
                            required: 'Unit price is required',
                            min: { value: 0, message: 'Unit price cannot be negative' }
                          })}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                            errors.lineItems?.[index]?.unitPrice ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="0"
                         
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`lineItems.${index}.taxPercent`, {
                            min: { value: 0, message: 'Tax percentage cannot be negative' },
                            max: { value: 100, message: 'Tax percentage cannot exceed 100' }
                          })}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                            errors.lineItems?.[index]?.taxPercent ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="0"
                          max="100"
                          
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={watchedLineItems[index]?.taxableValue?.toFixed(2) || '0.00'}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                          readOnly
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={watchedLineItems[index]?.totalAmount?.toFixed(2) || '0.00'}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-medium"
                          readOnly
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-white rounded-xl shadow-lg p-8 w-96">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="font-semibold text-lg">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Total Tax:</span>
                  <span className="font-semibold text-lg">₹{totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-t-2 border-indigo-200 bg-indigo-50 -mx-4 px-4 rounded-lg">
                  <span className="text-xl font-bold text-indigo-900">Grand Total:</span>
                  <span className="text-2xl font-bold text-indigo-900">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="bg-gray-600 text-white hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleSubmitGRN}
                  disabled={loading}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="bg-yellow-600 text-white hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </button>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <X className="h-5 w-5 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GRNForm;