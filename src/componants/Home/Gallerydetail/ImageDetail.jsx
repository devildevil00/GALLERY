import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ImageDetail.css';

function ImageDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [imageDetails, setImageDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showFullSize, setShowFullSize] = useState(false);

    const fetchImageDetails = async () => {
        try {
            setLoading(true);
            const url = `http://localhost:8080/api/images/${id}`;
            const result = await fetch(url);
            const { data } = await result.json();
            setImageDetails(data);
        } catch (err) {
            toast.error('Failed to load image details. Please try again.');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const deleteImage = async () => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        
        try {
            const url = `http://localhost:8080/api/images/${id}`;
            await fetch(url, { method: 'DELETE' });
            toast.success('Image deleted successfully');
            navigate('/');
        } catch (err) {
            toast.error('Failed to delete image.');
        }
    };

    const downloadImage = async () => {
        try {
            const response = await fetch(imageDetails.imageURL);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = imageDetails.originalName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Download started!');
        } catch (err) {
            toast.error('Failed to download image.');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        fetchImageDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="detail-loading">
                <div className="detail-spinner"></div>
                <p>Loading image details...</p>
            </div>
        );
    }

    if (!imageDetails) {
        return (
            <div className="detail-error">
                <div className="error-icon">⚠️</div>
                <h2>Image not found</h2>
                <p>The image you're looking for doesn't exist or has been deleted.</p>
                <Link to="/" className="back-btn">← Back to Gallery</Link>
            </div>
        );
    }

    return (
        <>
            <div className='image-detail-container'>
                <div className="detail-header">
                    <div className="header-left">
                        <Link to="/" className="back-link">
                            <span className="back-icon">←</span>
                            Back to Gallery
                        </Link>
                    </div>
                    <div className="header-actions">
                        <button onClick={downloadImage} className="action-btn download-btn">
                            <span className="btn-icon">⬇️</span>
                            Download
                        </button>
                        <button onClick={deleteImage} className="action-btn delete-btn">
                            <span className="btn-icon">🗑️</span>
                            Delete
                        </button>
                    </div>
                </div>

                <div className="detail-content">
                    <div className="image-section">
                        <div className="image-container">
                            <img
                                src={imageDetails.imageURL}
                                alt={imageDetails.originalName}
                                className={`detail-image ${imageLoaded ? 'loaded' : ''}`}
                                onLoad={() => setImageLoaded(true)}
                                onClick={() => setShowFullSize(true)}
                            />
                            {!imageLoaded && (
                                <div className="image-loading">
                                    <div className="image-spinner"></div>
                                </div>
                            )}
                            <div className="image-overlay-info">
                                <span className="zoom-hint">🔍 Click to view full size</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <div className="info-card">
                            <h1 className="image-title">{imageDetails.originalName}</h1>
                            
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">📄 File Type</span>
                                    <span className="info-value">{imageDetails.mimeType}</span>
                                </div>
                                
                                <div className="info-item">
                                    <span className="info-label">📊 File Size</span>
                                    <span className="info-value">{formatFileSize(imageDetails.size)}</span>
                                </div>
                                
                                <div className="info-item">
                                    <span className="info-label">📅 Upload Date</span>
                                    <span className="info-value">{formatDate(imageDetails.createdAt)}</span>
                                </div>
                                
                                <div className="info-item">
                                    <span className="info-label">🔗 Image URL</span>
                                    <span className="info-value url-value" title={imageDetails.imageURL}>
                                        {imageDetails.imageURL.length > 50 
                                            ? imageDetails.imageURL.substring(0, 50) + '...' 
                                            : imageDetails.imageURL
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Size Modal */}
            {showFullSize && (
                <div className="fullsize-modal" onClick={() => setShowFullSize(false)}>
                    <div className="modal-overlay">
                        <button 
                            className="modal-close" 
                            onClick={() => setShowFullSize(false)}
                        >
                            ✕
                        </button>
                        <img 
                            src={imageDetails.imageURL} 
                            alt={imageDetails.originalName}
                            className="modal-image"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="modal-info">
                            <p>{imageDetails.originalName}</p>
                            <span>{formatFileSize(imageDetails.size)}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ImageDetail;
