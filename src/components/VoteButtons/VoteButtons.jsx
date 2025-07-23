import { useState } from 'react'
import PropTypes from 'prop-types'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import './VoteButtons.css'

const VoteButtons = ({ reportId, initialVotes = {}, compact = false }) => {
    const { positivos = 0, negativos = 0 } = initialVotes
    const { user } = useAuth()
    const { voteReport } = useReports()
    const [isVoting, setIsVoting] = useState(false)
    const [votosPositivos, setVotosPositivos] = useState(positivos)
    const [votosNegativos, setVotosNegativos] = useState(negativos)

    const handleVote = async (voteType) => {
        if (!user || isVoting) return

        setIsVoting(true)
        try {
            const result = await voteReport(reportId, voteType)

            // Actualizar los votos localmente si el servidor devuelve los nuevos valores
            if (result) {
                setVotosPositivos(result.votos_positivos || votosPositivos)
                setVotosNegativos(result.votos_negativos || votosNegativos)
            }
        } catch (error) {
            console.error('Error al votar:', error)
        } finally {
            setIsVoting(false)
        }
    }

    const totalVotes = votosPositivos + votosNegativos
    const positivePercentage = totalVotes > 0 ? (votosPositivos / totalVotes) * 100 : 0

    return (
        <div className={`vote-buttons ${compact ? 'compact' : ''}`}>
            {!compact && (
                <div className="vote-stats">
                    <div className="vote-bar">
                        <div
                            className="vote-bar-positive"
                            style={{ width: `${positivePercentage}%` }}
                        />
                    </div>
                    <div className="vote-counts">
                        <span className="positive-votes">
                            {votosPositivos} positivos
                        </span>
                        <span className="negative-votes">
                            {votosNegativos} negativos
                        </span>
                    </div>
                </div>
            )}

            {user ? (
                <div className="vote-actions">
                    <button
                        onClick={() => handleVote('up')}
                        disabled={isVoting}
                        className="vote-btn vote-up"
                        title="Votar positivo"
                    >
                        <ThumbsUp className="icon" />
                        <span>{votosPositivos}</span>
                    </button>

                    <button
                        onClick={() => handleVote('down')}
                        disabled={isVoting}
                        className="vote-btn vote-down"
                        title="Votar negativo"
                    >
                        <ThumbsDown className="icon" />
                        <span>{votosNegativos}</span>
                    </button>
                </div>
            ) : (
                <div className="vote-display">
                    <div className="vote-item positive">
                        <ThumbsUp className="icon" />
                        <span>{votosPositivos}</span>
                    </div>
                    <div className="vote-item negative">
                        <ThumbsDown className="icon" />
                        <span>{votosNegativos}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

VoteButtons.propTypes = {
    reportId: PropTypes.number.isRequired,
    initialVotes: PropTypes.shape({
        positivos: PropTypes.number,
        negativos: PropTypes.number
    }),
    compact: PropTypes.bool
}

export default VoteButtons
