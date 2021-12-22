import React from 'react';
import './component.css'

export default props => {
    let now = new Date();
    let bulletStyle = {
        left: props.bullet.x - props.bullet.r,
        top: props.bullet.worldHeight - props.bullet.y - props.bullet.r,
        width: 2.0*props.bullet.r,
        height: 2.0*props.bullet.r,
        opacity: 1.0*(props.bullet.lifetime - (now - props.bullet.time))/props.bullet.lifetime,
        boxShadow: '0px 0px 12px 3px ' + props.bullet.color,
        boxSizing: 'border-box'
    };
    return (
        <div className='bullet' style={bulletStyle}>
        </div>
    )
};