import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ImageGallary.css';

function ImageGallary() {
    const [imageList, setImageList] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [selectedImages, setSelectedImages] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const fetchImages = async () => {
        try {
            const url = 'https://gallery-backend-v1co.onrender.com/api/images';
            const result = await fetch(url);
            const { data } = await result.json();
            setImageList(data);
            setFilteredImages(data);
        } catch (err) {
            toast.error('Failed to fetch images. Please try again.');
        }
    };

    const deleteImage = async (imageId) => {
        try {
            const url = `https://gallery-backend-v1co.onrender.com/api/images/${imageId}`;
            const result = await fetch(url, { method: 'DELETE' });
            const { message } = await result.json();
            toast.success(message);
            fetchImages();
        } catch (err) {
            toast.error('Failed to delete image.');
        }
    };

    const deleteSelectedImages = async () => {
        if (selectedImages.length === 0) return;
        
        try {
            const deletePromises = selectedImages.map(id => 
                fetch(`https://gallery-backend-v1co.onrender.com/api/images/${id}`, { method: 'DELETE' })
            );
            await Promise.all(deletePromises);
            toast.success(`${selectedImages.length} images deleted successfully`);
            setSelectedImages([]);
            setIsSelectionMode(false);
            fetchImages();
        } catch (err) {
            toast.error('Failed to delete selected images.');
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Filter and sort images
    useEffect(() => {
        let filtered = imageList.filter(image => 
            image.originalName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort images
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.originalName.localeCompare(b.originalName);
                case 'date':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'size':
                    return b.size - a.size;
                default:
                    return 0;
            }
        });

        setFilteredImages(filtered);
    }, [imageList, searchTerm, sortBy]);

    const handleImageSelect = (imageId) => {
        if (selectedImages.includes(imageId)) {
            setSelectedImages(selectedImages.filter(id => id !== imageId));
        } else {
            setSelectedImages([...selectedImages, imageId]);
        }
    };

    const selectAllImages = () => {
        if (selectedImages.length === filteredImages.length) {
            setSelectedImages([]);
        } else {
            setSelectedImages(filteredImages.map(img => img._id));
        }
    };

    const onDrop = async (acceptedFiles) => {
        setLoading(true);
        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append('images', file);
        });
        try {
            const options = {
                method: 'POST',
                body: formData
            };
            const url = 'https://gallery-backend-v1co.onrender.com/api/images/upload-images';
            const result = await fetch(url, options);
            const { message } = await result.json();
            fetchImages();
            setLoading(false);
            toast.success(message);
        } catch (err) {
            console.log('Error while uploading images ', err);
            toast.error('Error uploading images');
            setLoading(false);
        }
    };
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <div className='gallery-container'>
            <div className='gallery-header'>
                <h1 className='gallery-title'>🖼️ Image Gallery</h1>
                <div className='upload-section'>
                    <div {...getRootProps()} className='dropzone'>
                        <input {...getInputProps()} />
                        <div className='dropzone-content'>
                            <i className='upload-icon'>📁</i>
                            <p>Drag & drop images here, or click to browse</p>
                            <span className='upload-hint'>Supports JPG, PNG, GIF</span>
                        </div>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Uploading images...</p>
                </div>
            )}

            <div className='gallery-controls'>
                <div className='search-bar'>
                    <input
                        type='text'
                        placeholder='🔍 Search images...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='search-input'
                    />
                </div>
                
                <div className='controls-right'>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className='sort-select'
                    >
                        <option value='name'>Sort by Name</option>
                        <option value='date'>Sort by Date</option>
                        <option value='size'>Sort by Size</option>
                    </select>
                    
                    <div className='view-toggle'>
                        <button 
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            ⊞
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            ☰
                        </button>
                    </div>
                    
                    <button 
                        className='selection-btn'
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                    >
                        {isSelectionMode ? 'Cancel' : 'Select'}
                    </button>
                </div>
            </div>

            {isSelectionMode && (
                <div className='selection-controls'>
                    <div className='selection-info'>
                        <span>{selectedImages.length} images selected</span>
                        <button onClick={selectAllImages} className='select-all-btn'>
                            {selectedImages.length === filteredImages.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    {selectedImages.length > 0 && (
                        <button onClick={deleteSelectedImages} className='delete-selected-btn'>
                            🗑️ Delete Selected ({selectedImages.length})
                        </button>
                    )}
                </div>
            )}

            <div className='gallery-stats'>
                <span>{filteredImages.length} images {searchTerm && `(filtered from ${imageList.length})`}</span>
            </div>

            <div className={`image-container ${viewMode}`}>
                {filteredImages.length === 0 ? (
                    <div className='empty-state'>
                        <div className='empty-icon'>📷</div>
                        <h3>No images found</h3>
                        <p>{searchTerm ? 'Try adjusting your search terms' : 'Upload some images to get started'}</p>
                    </div>
                ) : (
                    filteredImages.map((image, index) => (
                        <div key={image._id} className={`image-card ${isSelectionMode ? 'selection-mode' : ''}`}>
                            {isSelectionMode && (
                                <div className='selection-checkbox'>
                                    <input
                                        type='checkbox'
                                        checked={selectedImages.includes(image._id)}
                                        onChange={() => handleImageSelect(image._id)}
                                    />
                                </div>
                            )}
                            
                            <div className='image-wrapper'>
                                <Link className='image-link' to={`/${image._id}`}>
                                    <img 
                                        src={image.imageURL} 
                                        alt={image.originalName}
                                        loading='lazy'
                                        className='gallery-image'
                                    />
                                    <div className='image-overlay'>
                                        <div className='overlay-content'>
                                            <span className='view-text'>👁️ View Details</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            
                            <div className='image-info'>
                                <h4 className='image-title'>{image.originalName}</h4>
                                <div className='image-meta'>
                                    <span className='image-size'>{Math.round(image.size / 1024)} KB</span>
                                    <span className='image-type'>{image.mimeType?.split('/')[1]?.toUpperCase()}</span>
                                </div>
                            </div>
                            
                            {!isSelectionMode && (
                                <div className='image-actions'>
                                    <button 
                                        className='delete-btn'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (window.confirm('Are you sure you want to delete this image?')) {
                                                deleteImage(image._id);
                                            }
                                        }}
                                        title='Delete image'
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            <ToastContainer
                position='top-right'
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}

export default ImageGallary;
