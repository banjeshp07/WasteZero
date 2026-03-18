import React from 'react';
import { useToast } from '../ui/ToastContext';
import './MatchResultsModal.css';

const MatchResultsModal = ({ isOpen, onClose, matches, opportunityTitle, onSendInvitations }) => {
    const toast = useToast();
    const [selectedVolunteers, setSelectedVolunteers] = React.useState([]);

    if (!isOpen) return null;

    const handleCheckboxChange = (volunteerId) => {
        setSelectedVolunteers(prev => {
            if (prev.includes(volunteerId)) {
                return prev.filter(id => id !== volunteerId);
            } else {
                return [...prev, volunteerId];
            }
        });
    };

    const handleSendInvitations = () => {
        if (selectedVolunteers.length === 0) {
            toast.error('Please select at least one volunteer');
            return;
        }
        onSendInvitations(selectedVolunteers);
        setSelectedVolunteers([]);
        onClose();
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#4CAF50';
        if (score >= 60) return '#FBC02D';
        if (score >= 40) return '#FF9800';
        return '#FF5252';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🎯 Matched Volunteers</h2>
                    <h3>{opportunityTitle}</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {matches.length === 0 ? (
                        <p className="no-matches">No volunteers found matching the criteria.</p>
                    ) : (
                        <div className="matches-table-container">
                            <table className="matches-table">
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>Volunteer</th>
                                        <th>Location</th>
                                        <th>Skills</th>
                                        <th>Match Score</th>
                                        <th>Breakdown</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.map((match) => (
                                        <tr key={match.volunteerId}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedVolunteers.includes(match.volunteerId)}
                                                    onChange={() => handleCheckboxChange(match.volunteerId)}
                                                />
                                            </td>
                                            <td>
                                                <div className="volunteer-info">
                                                    <strong>{match.name}</strong>
                                                    <small>{match.email}</small>
                                                </div>
                                            </td>
                                            <td>{match.location || 'N/A'}</td>
                                            <td>
                                                <div className="skills-list">
                                                    {match.skills && match.skills.length > 0
                                                        ? match.skills.slice(0, 2).join(', ') + (match.skills.length > 2 ? '...' : '')
                                                        : 'None'}
                                                </div>
                                            </td>
                                            <td>
                                                <div
                                                    className="match-score"
                                                    style={{
                                                        background: getScoreColor(match.matchScore),
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        fontWeight: 'bold',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    {match.matchScore}%
                                                </div>
                                            </td>
                                            <td>
                                                <div className="breakdown">
                                                    <small>📍 {match.breakdown.location}%</small>
                                                    <small>🛠️ {match.breakdown.skills}%</small>
                                                    <small>📅 {match.breakdown.availability}%</small>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleSendInvitations}
                        disabled={selectedVolunteers.length === 0}
                    >
                        Send Invitations ({selectedVolunteers.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchResultsModal;
