import { ChangeEventHandler, useEffect, useState } from 'react'
import cx from 'classnames'
import styled from 'styled-components'
import ReactHowler from 'react-howler'

import musicOn from '../../assets/music-regular.svg'
import musicOff from '../../assets/music-slash-regular.svg'
import audioFile from '../../assets/royalsociety-audio.mp3'
import './index.module.css'

const AudioControl = () => {
    const [isHovered, setIsHovered] = useState(false)
    const [muted, setMuted] = useState(false)
    const [volume, setVolume] = useState(1.0);

    useEffect(() => {
        localStorage.setItem(
            'royalsociety_audioSettings',
            JSON.stringify({ volume, muted })
        )
    }, [volume, muted])

    const handleMutedChange = (muted) => {
        setMuted(muted)
    }

    const handleVolumeChange = event => {
        setVolume(parseFloat(event.target.value))
    }

    return (
        <div
            className="click-cursor wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <ReactHowler
                src={audioFile}
                // src="https://drive.google.com/file/d/1HHhpSdVPtjeRZZ2PbrJBCL_vSjg6-7fi/view"
                // src="https://drive.google.com/uc?export=download&id=1HHhpSdVPtjeRZZ2PbrJBCL_vSjg6-7fi"
                loop={true}
                mute={muted}
                volume={volume}
            />
            <MuteButton onClick={() => handleMutedChange(!muted)}>
            {muted ? (
                <img className="muted-music" src={musicOff} alt="Music muted" />
                ) : (
                <img src={musicOn} alt="Music on" />
            )}
            </MuteButton>
            {isHovered && (
                <div className="volume">
                    <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.025"
                        value={`${muted ? 0.0 : volume}`}
                        onChange={handleVolumeChange}
                    />
                </div>
            )}
        </div>
    )
}

export default AudioControl

const MuteButton = styled.div.attrs(props => ({
    className: 'mute-wrapper'
}))`
    width: 40px;
    height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  
    img {
        width: 20px;
    
        &.muted-music {
            width: 24px;
        }
    }
  
    &:hover {
        background: rgba(0, 0, 0, 0.25);
    }
`
  