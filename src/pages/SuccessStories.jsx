import React, { useEffect } from 'react';
import coupleImg1 from '../assets/success_couple.png';
import coupleImg2 from '../assets/weunited_banner.jpg'; // Using existing banner as placeholder for couple 2
import coupleImg3 from '../assets/weunited_banner5.jpg'; // and banner 5 for couple 3
import { Quote } from 'lucide-react';
import './SuccessStories.css';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const SuccessStories = () => {
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [ref, isVisible] = useIntersectionObserver();

    const stories = [
        {
            names: "Aarav & Meera",
            date: "Married Nov 2025",
            quote: "WeUnited made finding a partner who understood both my modern Canadian lifestyle and deep-rooted Indian values incredibly easy. The verified profiles gave us peace of mind from day one.",
            image: coupleImg1
        },
        {
            names: "Omar & Fatima",
            date: "Engaged Jan 2026",
            quote: "I was skeptical about online matrimony, but the detailed filtering by community and religious views helped me find someone truly compatible. We just got engaged last month!",
            image: coupleImg2
        },
        {
            names: "James & Sarah",
            date: "Married Aug 2024",
            quote: "The personalized matchmaking algorithm works wonders. We were matched based on our shared love for the outdoors and similar life goals. Thank you for bringing us together.",
            image: coupleImg3
        }
    ];

    return (
        <section className="success-stories section-padding" ref={ref}>
            <div className={`container ${isVisible ? 'animate-fade-in-up' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>

                <div className="success-header">
                    <span className="success-subtitle">Testimonials</span>
                    <h2 className="success-title">Happily Ever After</h2>
                    <p className="success-desc">
                        Don't just take our word for it. Read the heartwarming stories of couples who found their forever partners through WeUnited.
                    </p>
                </div>

                <div className="stories-grid">
                    {stories.map((story, index) => (
                        <div
                            key={index}
                            className={`story-card ${isVisible ? `animate-fade-in delay-${(index + 1) * 200}` : ''}`}
                            style={{ opacity: isVisible ? 1 : 0 }}
                        >
                            <div className="story-image-container">
                                <img
                                    src={story.image}
                                    alt={`${story.names} Success Story`}
                                    className="story-image"
                                    loading="lazy"
                                />
                            </div>
                            <div className="story-content">
                                <Quote size={32} className="quote-icon" />
                                <p className="story-quote">"{story.quote}"</p>

                                <div className="story-footer">
                                    <div>
                                        <h3 className="story-names">{story.names}</h3>
                                        <p className="story-date">{story.date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;
