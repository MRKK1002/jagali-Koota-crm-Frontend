import { useState, useEffect } from "react";
import RestoNav from "@/Restaurant/RestoNav";
import { toast } from "react-toastify";
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  FileText,
  Save,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchDualBackend } from "@/utils/apiHelpers";

// Helper function to get the correct image URL
const getImageUrl = (imagePath, timestamp) => {
  if (!imagePath) return null;
  
  // If it's already a full URL (S3 or external), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return timestamp ? `${imagePath}?t=${timestamp}` : imagePath;
  }
  
  // Always use production server for images (same as Admin Panel)
  const baseUrl = "https://crm.jagalikoota.com";
  
  // Clean up the path - handle both forward and backward slashes
  let cleanPath = imagePath.trim().replace(/\\/g, '/');
  
  // Remove leading slash if present
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Encode only the filename to handle spaces
  const pathParts = cleanPath.split('/');
  const filename = pathParts[pathParts.length - 1];
  const encodedFilename = encodeURIComponent(filename);
  const pathWithoutFilename = pathParts.slice(0, -1).join('/');
  
  const fullUrl = pathWithoutFilename ? `${baseUrl}/${pathWithoutFilename}/${encodedFilename}` : `${baseUrl}/${encodedFilename}`;
  const finalUrl = timestamp ? `${fullUrl}?t=${timestamp}` : fullUrl;
  console.log(`Image URL: ${imagePath} -> ${finalUrl}`);
  
  return finalUrl;
};

const RestaurantProfile = () => {
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    branchName: "",
    gstNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
    },
    contact: {
      phone: "",
      email: "",
    },
    openingHours: {
      mondayToFriday: "11:00 AM - 11:00 PM",
      saturday: "11:00 AM - 12:00 AM",
      sunday: "12:00 PM - 10:00 PM",
    },
  });

  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  const fetchAllRestaurants = async () => {
    try {
      setLoading(true);
      
      // Fetch from both backends separately to handle different response formats
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com/api/v1";
      const API_BASE_URL_SECONDARY = import.meta.env.VITE_API_URL_SECONDARY || "https://crm.jagalikoota.com/api/v1";
      
      // Only fetch from /getAllRestaurants on both backends
      // Both backends should return restaurants (secondary includes branches via adapter)
      const [primaryResponse, secondaryResponse] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/hotel/getAllRestaurants`).then(r => r.json()),
        fetch(`${API_BASE_URL_SECONDARY}/hotel/getAllRestaurants`).then(r => r.json())
      ]);
      
      let allRestaurants = [];
      
      // Handle primary backend response (crm_backend)
      if (primaryResponse.status === 'fulfilled') {
        const primaryData = primaryResponse.value;
        const primaryRestaurants = Array.isArray(primaryData) ? primaryData : (primaryData.data || primaryData.hotels || []);
        allRestaurants = [...primaryRestaurants];
        console.log(`✅ Primary backend: ${primaryRestaurants.length} restaurants`);
      }
      
      // Handle secondary backend response (JagaliKootaAws - includes branches via adapter)
      if (secondaryResponse.status === 'fulfilled') {
        const secondaryData = secondaryResponse.value;
        const secondaryRestaurants = Array.isArray(secondaryData) ? secondaryData : (secondaryData.data || secondaryData.hotels || []);
        
        // Merge and remove duplicates based on _id
        const existingIds = new Set(allRestaurants.map(r => r._id));
        secondaryRestaurants.forEach(restaurant => {
          if (!existingIds.has(restaurant._id)) {
            allRestaurants.push(restaurant);
          }
        });
        console.log(`✅ Secondary backend: ${secondaryRestaurants.length} restaurants (includes branches)`);
      }
      
      setRestaurants(allRestaurants);
      console.log(
        `📊 Total restaurants from BOTH backends: ${allRestaurants.length}`,
        allRestaurants
      );
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Failed to load restaurants. Please check if backends are running.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      branchName: "",
      gstNumber: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
      },
      contact: {
        phone: "",
        email: "",
      },
      openingHours: {
        mondayToFriday: "11:00 AM - 11:00 PM",
        saturday: "11:00 AM - 12:00 AM",
        sunday: "12:00 PM - 10:00 PM",
      },
    });
    setSelectedRestaurant(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddRestaurant = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditRestaurant = (restaurant) => {
    console.log("=== EDITING RESTAURANT ===");
    console.log("Restaurant data:", restaurant);
    console.log("Address type:", typeof restaurant.address);
    console.log("Address value:", restaurant.address);
    
    setSelectedRestaurant(restaurant);
    
    // Parse address if it's a string (from branches)
    let addressData = restaurant.address;
    if (typeof restaurant.address === 'string') {
      // Address is a simple string, try to parse it
      const parts = restaurant.address.split(',').map(p => p.trim());
      console.log("Address parts:", parts);
      
      // Look for common patterns: last part is usually country, second-to-last is state, third-to-last is city
      if (parts.length >= 3) {
        // Check if last part looks like a country (India, USA, etc.)
        const lastPart = parts[parts.length - 1];
        const isCountry = lastPart.length < 30 && !lastPart.match(/\d{6}/); // Not a pincode
        
        if (isCountry) {
          // Format: "Street parts..., City, State, Country"
          addressData = {
            street: parts.slice(0, -3).join(', '),
            city: parts[parts.length - 3] || "",
            state: parts[parts.length - 2] || "",
            country: parts[parts.length - 1] || ""
          };
        } else {
          // Format: "Street parts..., City, State Pincode" (no country)
          addressData = {
            street: parts.slice(0, -2).join(', '),
            city: parts[parts.length - 2] || "",
            state: parts[parts.length - 1] || "",
            country: ""
          };
        }
      } else if (parts.length === 2) {
        addressData = {
          street: parts[0],
          city: parts[1] || "",
          state: "",
          country: ""
        };
      } else {
        addressData = {
          street: restaurant.address,
          city: "",
          state: "",
          country: ""
        };
      }
      console.log("Parsed address:", addressData);
    }
    
    const formDataToSet = {
      branchName: restaurant.branchName || restaurant.restaurantName || "",
      gstNumber: restaurant.gstNumber || "",
      address: {
        street: addressData?.street || "",
        city: addressData?.city || "",
        state: addressData?.state || "",
        country: addressData?.country || "",
      },
      contact: {
        phone: restaurant.contact?.phone || "",
        email: restaurant.contact?.email || "",
      },
      openingHours: {
        mondayToFriday:
          restaurant.openingHours?.mondayToFriday || "11:00 AM - 11:00 PM",
        saturday: restaurant.openingHours?.saturday || "11:00 AM - 12:00 AM",
        sunday: restaurant.openingHours?.sunday || "12:00 PM - 10:00 PM",
      },
    };
    
    console.log("Form data to set:", formDataToSet);
    setFormData(formDataToSet);
    
    // Set image preview if restaurant has an image
    if (restaurant.image) {
      const imageUrl = getImageUrl(restaurant.image);
      console.log("Setting image preview:", imageUrl);
      setImagePreview(imageUrl);
    }
    setShowForm(true);
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) {
      return;
    }
    try {
      setLoading(true);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com/api/v1";
      const API_BASE_URL_SECONDARY = import.meta.env.VITE_API_URL_SECONDARY || "https://crm.jagalikoota.com/api/v1";
      
      // Delete from both backends - try both restaurant and branch endpoints
      const promises = [
        // Primary backend - try restaurant endpoint
        fetch(`${API_BASE_URL}/hotel/deleteRestaurant/${id}`, {
          method: "DELETE",
        }).then(r => r.json()).catch(err => {
          console.warn("Primary backend restaurant delete failed:", err);
          return null;
        }),
        // Primary backend - try branch endpoint
        fetch(`${API_BASE_URL}/hotel/branch/${id}`, {
          method: "DELETE",
        }).then(r => r.json()).catch(err => {
          console.warn("Primary backend branch delete failed:", err);
          return null;
        }),
        // Secondary backend - try restaurant endpoint (adapter)
        fetch(`${API_BASE_URL_SECONDARY}/hotel/hotel/${id}`, {
          method: "DELETE",
        }).then(r => r.json()).catch(err => {
          console.warn("Secondary backend restaurant delete failed:", err);
          return null;
        }),
        // Secondary backend - try branch endpoint
        fetch(`${API_BASE_URL_SECONDARY}/hotel/branch/${id}`, {
          method: "DELETE",
        }).then(r => r.json()).catch(err => {
          console.warn("Secondary backend branch delete failed:", err);
          return null;
        })
      ];

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
      
      if (successCount > 0) {
        toast.success(`Restaurant/Branch deleted successfully from ${successCount} endpoint(s)!`);
        fetchAllRestaurants();
        if (selectedRestaurant?._id === id) {
          resetForm();
          setShowForm(false);
        }
      } else {
        toast.error("Failed to delete from all backends");
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      toast.error("Failed to delete restaurant: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [field]: value,
        },
      });
    } else if (name.startsWith("contact.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        contact: {
          ...formData.contact,
          [field]: value,
        },
      });
    } else if (name.startsWith("openingHours.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        openingHours: {
          ...formData.openingHours,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("restaurant-image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.branchName ||
      !formData.gstNumber ||
      !formData.address.street ||
      !formData.address.city ||
      !formData.address.state ||
      !formData.address.country ||
      !formData.contact.phone ||
      !formData.contact.email
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      const endpoint = selectedRestaurant
        ? `/hotel/updateRestaurant/${selectedRestaurant._id}`
        : `/hotel/createRestaurant`;
      const method = selectedRestaurant ? "PUT" : "POST";

      // Prepare FormData for image upload
      const formDataToSend = new FormData();
      formDataToSend.append("branchName", formData.branchName);
      formDataToSend.append("gstNumber", formData.gstNumber);
      formDataToSend.append("address", JSON.stringify(formData.address));
      formDataToSend.append("contact", JSON.stringify(formData.contact));
      formDataToSend.append("openingHours", JSON.stringify(formData.openingHours));
      
      // Add image if selected
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      // Use fetchDualBackend to ensure same _id on both backends
      await fetchDualBackend(endpoint, {
        method,
        body: formDataToSend,
      });
      
      toast.success(
        selectedRestaurant
          ? `Restaurant updated successfully!`
          : `Restaurant created successfully!`
      );
      fetchAllRestaurants();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving restaurant profile:", error);
      toast.error("Failed to save restaurant profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && restaurants.length === 0 && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 w-full -ml-6 -mt-6 -mb-6">
      <RestoNav />

      <div className="pl-4 md:pl-6 pr-4 md:pr-6 pt-4 md:pt-6 pb-0 w-full">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              Restaurant Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your restaurant branches and settings
            </p>
          </div>
          {/* Add Restaurant button removed - Use JagaliKoota Admin Panel */}
          {!showForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
              <strong>Read-Only:</strong> Manage restaurants in JagaliKoota Admin Panel
            </div>
          )}
        </div>

        {/* Restaurants List */}
        {!showForm && restaurants.length > 0 && (
          <Card className="mb-0 w-full max-w-none">
            <CardHeader>
              <CardTitle>Restaurant Branches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {restaurants.map((rest) => (
                  <div
                    key={rest._id}
                    className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 gap-4"
                  >
                    {/* Restaurant Image */}
                    {rest.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={getImageUrl(rest.image, rest.updatedAt ? new Date(rest.updatedAt).getTime() : null)}
                          alt={rest.branchName || rest.restaurantName}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', getImageUrl(rest.image));
                          }}
                          onError={(e) => {
                            console.error('❌ Image failed to load:', rest.image);
                            // Show placeholder on error
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-20 h-20 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center';
                            placeholder.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>';
                            e.target.parentNode.replaceChild(placeholder, e.target);
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {rest.branchName ||
                          rest.restaurantName ||
                          "Unnamed Branch"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        GST: {rest.gstNumber || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {rest.address?.city}, {rest.address?.state} |{" "}
                        {rest.contact?.phone}
                      </p>
                    </div>
                    {/* Edit/Delete buttons removed - Use JagaliKoota Admin Panel for management */}
                    <div className="text-sm text-gray-500 italic">
                      View only
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!showForm && restaurants.length === 0 && (
          <Card className="w-full max-w-none">
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No restaurants added yet</p>
              <Button onClick={handleAddRestaurant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Restaurant
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {showForm && (
          <div className="w-full">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Card */}
              <Card className="w-full max-w-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branchName">
                        Branch Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="branchName"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        placeholder="Enter branch name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">
                        GST Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="gstNumber"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        placeholder="Enter GST number"
                        required
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-image-upload">Restaurant Image</Label>
                    <div className="mt-2">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Restaurant preview"
                            className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="restaurant-image-upload"
                          className="flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-10 w-10 text-gray-400 mb-3" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </label>
                      )}
                      <input
                        type="file"
                        id="restaurant-image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Card */}
              <Card className="w-full max-w-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address.street">
                      Street Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address.street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      placeholder="Enter street address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address.city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address.state">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address.state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address.country">
                        Country <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address.country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        placeholder="Enter country"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card className="w-full max-w-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact.phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact.phone"
                        name="contact.phone"
                        type="tel"
                        value={formData.contact.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact.email">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact.email"
                        name="contact.email"
                        type="email"
                        value={formData.contact.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opening Hours Card */}
              <Card className="w-full max-w-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openingHours.mondayToFriday">
                        Monday - Friday
                      </Label>
                      <Input
                        id="openingHours.mondayToFriday"
                        name="openingHours.mondayToFriday"
                        value={formData.openingHours.mondayToFriday}
                        onChange={handleInputChange}
                        placeholder="11:00 AM - 11:00 PM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="openingHours.saturday">Saturday</Label>
                      <Input
                        id="openingHours.saturday"
                        name="openingHours.saturday"
                        value={formData.openingHours.saturday}
                        onChange={handleInputChange}
                        placeholder="11:00 AM - 12:00 AM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="openingHours.sunday">Sunday</Label>
                      <Input
                        id="openingHours.sunday"
                        name="openingHours.sunday"
                        value={formData.openingHours.sunday}
                        onChange={handleInputChange}
                        placeholder="12:00 PM - 10:00 PM"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="min-w-[150px]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {selectedRestaurant
                        ? "Update Restaurant"
                        : "Create Restaurant"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantProfile;
