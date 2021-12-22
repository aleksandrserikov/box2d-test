import React from 'react';
import './component.css'

export default props => {
    let speedShadow = { x: 0, y: 0 };
    speedShadow.x = props.box.vx*Math.cos(props.box.angle* Math.PI / 180) + props.box.vy*Math.sin(props.box.angle* Math.PI / 180)
    speedShadow.y = -props.box.vx*Math.sin(props.box.angle* Math.PI / 180) + props.box.vy*Math.cos(props.box.angle* Math.PI / 180)
    let now = new Date();
    let hitColor = props.box.hitPoints/2.5;
    let boxStyle = {
        left: props.box.x - props.box.w/2,
        top: props.box.worldHeight - props.box.y - props.box.h/2,
        width: props.box.w,
        height: props.box.h,
        opacity: props.box.lifetime === 0 ? 1 : 1.0*(props.box.lifetime - (now - props.box.time))/props.box.lifetime,
        transform: 'rotate(' + (-props.box.angle) + 'deg)',
        borderColor: 'black',
        background: props.box.input ? ("linear-gradient(90deg, rgba(127,242,144,1) 0%, rgba(127,242,144,1) "+hitColor+"%, rgba(255,255,255,1) "+(hitColor+0.1)+"%, rgba(255,255,255,1) 100%)") : 'white center center / 20px no-repeat url(\'../assets/img/vis.png\')',
        boxSizing: 'border-box',
        boxShadow: (props.box.vx !== 0 || props.box.vy !== 0) ? -speedShadow.x*0.2 + 'px '+speedShadow.y*0.2+'px 12px 3px #2a65db99' : 'none',
    };
    return (
        <div className={ props.box.input ? 'input-box' : 'box' } style={boxStyle} onClick={() => { /*props.box.dir *= -1;*/ }}>
            { props.box.value }
        </div>
    )
};