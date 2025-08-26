'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ytkiddAPI from '@/apis/ytkidApi';

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    tags: [],
    type: 'default',
    active: false,
    original_pdf_url: '',
    access_tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [newAccessTag, setNewAccessTag] = useState('');

  useEffect(() => {
    if (params.slug) {
      fetchBook();
    }
  }, [params.slug]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await ytkiddAPI.GetBookDetail("", {}, { book_id: params.slug });

      if (!response.ok) {
        throw new Error('Failed to fetch book');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setBook(result.data);
        setFormData({
          slug: result.data.slug || '',
          title: result.data.title || '',
          description: result.data.description || '',
          tags: result.data.tags || [],
          type: result.data.type || 'default',
          active: result.data.active || false,
          original_pdf_url: result.data.pdf_url || '',
          access_tags: result.data.access_tags || []
        });
      } else {
        throw new Error('Book not found');
      }
    } catch (err) {
      setError('Failed to load book: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAccessTag = () => {
    if (newAccessTag.trim() && !formData.access_tags.includes(newAccessTag.trim())) {
      setFormData(prev => ({
        ...prev,
        access_tags: [...prev.access_tags, newAccessTag.trim()]
      }));
      setNewAccessTag('');
    }
  };

  const removeAccessTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      access_tags: prev.access_tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!book) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await ytkiddAPI.PatchUpdateBook("", {}, formData)

      if (!response.ok) {
        throw new Error('Failed to update book');
      }

      const result = await response.json();

      if (result.success) {
        setSuccess('Book updated successfully!');
        // Refresh book data
        await fetchBook();
      } else {
        throw new Error(result.error?.message || 'Failed to update book');
      }
    } catch (err) {
      setError('Failed to save book: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading book...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Book not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
          <p className="text-gray-600 mt-2">Update book information and settings</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Book Preview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Book Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {book.cover_file_url && (
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={book.cover_file_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Book ID: {book.id}</p>
                <p className="text-sm text-gray-600">Current Slug: {book.slug}</p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Book Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Book title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="book-slug"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Book description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf-url">Original PDF URL</Label>
                  <Input
                    id="pdf-url"
                    value={formData.original_pdf_url}
                    onChange={(e) => handleInputChange('original_pdf_url', e.target.value)}
                    placeholder="https://example.com/book.pdf"
                    type="url"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="default">Default</option>
                      <option value="workbook">Workbook</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => handleInputChange('active', checked)}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-4">
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag (e.g., level:A1, subject:math)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Access Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                      {formData.access_tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeAccessTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newAccessTag}
                        onChange={(e) => setNewAccessTag(e.target.value)}
                        placeholder="Add access tag (e.g., free, premium)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAccessTag())}
                      />
                      <Button type="button" onClick={addAccessTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="min-w-[100px]"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}