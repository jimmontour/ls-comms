import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter, Mail } from 'lucide-react';
import axios from 'axios';
import './Public.css';

interface LinkTreeData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brandColor: string;
  sections: any[];
  createdAt: string;
}

const LinkTreePublic: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [linkTree, setLinkTree] = useState<LinkTreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkTree = async () => {
      try {
        setLoading(true);
        // TODO: Create a public endpoint that doesn't require auth
        // For now, this is a placeholder
        setError('Link tree not found');
      } catch (err) {
        setError('Failed to load link tree');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchLinkTree();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="public-view">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !linkTree) {
    return (
      <div className="public-view">
        <div className="error-state">
          <h1>Link Tree Not Found</h1>
          <p>This link tree doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-view" style={{ '--brand-color': linkTree.brandColor } as React.CSSProperties}>
      <div className="link-tree-container">
        {/* Header */}
        <div className="lt-header">
          <h1>{linkTree.name}</h1>
          {linkTree.description && <p>{linkTree.description}</p>}
        </div>

        {/* Sections */}
        <div className="lt-sections">
          {linkTree.sections
            ?.filter((s: any) => s.enabled)
            .map((section: any, idx: number) => (
              <div key={idx} className="lt-section">
                <h2>{section.title}</h2>

                {section.type === 'socials' && (
                  <div className="social-links">
                    <a href="#facebook" className="social-btn facebook">
                      <Facebook size={20} />
                      Facebook
                    </a>
                    <a href="#instagram" className="social-btn instagram">
                      <Instagram size={20} />
                      Instagram
                    </a>
                    <a href="#twitter" className="social-btn twitter">
                      <Twitter size={20} />
                      X
                    </a>
                    <a href="#linkedin" className="social-btn linkedin">
                      <Linkedin size={20} />
                      LinkedIn
                    </a>
                  </div>
                )}

                {section.type === 'links' && (
                  <div className="quick-links">
                    <a href="#" className="link-btn">Link 1</a>
                    <a href="#" className="link-btn">Link 2</a>
                    <a href="#" className="link-btn">Link 3</a>
                  </div>
                )}

                {section.type === 'news' && (
                  <div className="news-section">
                    <p className="placeholder">Latest news will appear here</p>
                  </div>
                )}

                {section.type === 'newsletter' && (
                  <div className="newsletter-section">
                    <form className="newsletter-form">
                      <input type="email" placeholder="your@email.com" required />
                      <button type="submit">Subscribe</button>
                    </form>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LinkTreePublic;
