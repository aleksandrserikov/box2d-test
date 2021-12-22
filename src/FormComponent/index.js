import React from 'react';
import './component.css'
import {Box} from '../game'
import {Bullet} from '../game'
import BoxComponent from '../BoxComponent'
import BulletComponent from '../BulletComponent'
import { withRouter } from "react-router";

class FormComponent extends React.Component {
    Box2D = null;
    world = null;
    timer = null;
    constructor(props, staticContext) {
        super(props);
        this.state = {
            gameStarted: false,
            fps: 60,
            worldWidth: 1000,
            worldHeight: 500,
            time: new Date(),
            startTime: new Date(),
            boxes: [],
            inputs: [],
            bullets: [],
            wrongName: '',
            formError: '',
            ddlOptions: [
                'Мне очень нравится Visiology',
                'Не нравятся ограничения API Visiology',
                'Не нравятся архитектура Visiology',
                'Не нравятся устаревшие технологии Visiology',
                'Не нравится Dashboard Designer'
            ],
            ddlErrors: [
              '',
              'В следующей версии, которая выходит уже 30.02.2022, возможности Api расширены, выберите другой пункт',
              'Наша архитектура расчитана на продвинутых пользователей, Вы можете прочесть об этом в документации, а сейчас выберите другой пункт',
              'В новой версии на каждом листе обязательно будет по одному виджету на Vue, React и Angular, у Вас есть прекрасная возможность изменить Ваш ответ прямо сейчас',
              'Dashboard Designer просто потрясающий, не позорьтесь и выберите другой пункт'
            ],
            textAreaValidText: 'Visiology - самая лучшая система, я бы хотел чтобы она оставалась такой какая она есть и продолжала радовать пользователей и разработчиков.',
            form: {
                name: '',
                ddlOption: 'Мне очень нравится Visiology',
                count: 1,
                text: '',
                agreement: false
            },
            refs: {
                name: React.createRef(),
                ddlOption: React.createRef(),
                count: React.createRef(),
                text: React.createRef(),
                agreement: React.createRef()
            },
            showAlert: false,
            gameOver: false,
            youWin: false,
            saved: 0,
            losed: 0
        }
    }
    componentWillMount() {
        this.setState({ worldWidth: window.innerWidth - 20, worldHeight: window.innerHeight - 20 });

        let savedForm = localStorage.getItem('form');
        if (savedForm) {
            this.setState({form: JSON.parse(savedForm) });
        }
    }

    componentDidMount() {
        let _this = this;
        //_this.setState({time: new Date()});
        window.Box2D().then(function(Box2D) {
            _this.Box2D = Box2D;
            let gravity = new Box2D.b2Vec2(0.0, -100);
            let world = new Box2D.b2World(gravity);

            let bd_ground = new Box2D.b2BodyDef();
            let ground = world.CreateBody(bd_ground);

            let shape0 = new Box2D.b2EdgeShape();
            shape0.Set(new Box2D.b2Vec2(-2*_this.state.worldWidth, 0.0), new Box2D.b2Vec2(2*_this.state.worldWidth, 0.0));
            ground.CreateFixture(shape0, 0.0);

            _this.world = world;
            _this.addBoxes();

            let contactListener = new Box2D.JSContactListener();

            contactListener.BeginContact = function(contact)
            {
                contact = Box2D.wrapPointer(contact, Box2D.b2Contact);
                let bodyA = contact.GetFixtureA().GetBody();
                let bodyB = contact.GetFixtureB().GetBody();
                if (bodyA.type === 'input' && bodyB.type === 'bullet') {
                    bodyA.item.hitPoints--;
                }
                if (bodyB.type === 'input' && bodyA.type === 'bullet') {
                    bodyB.item.hitPoints--;
                }
            };
            contactListener.EndContact = function(contact) { };
            contactListener.PreSolve = function(contact, oldManifold) { };
            contactListener.PostSolve = function(contact, impulse) { };

            world.SetContactListener(contactListener);
        });
    }

    timerStep() {
        let stateUpdate = {};
        let _this = this;
        if (this.state && this.world && this.state.gameStarted) {
            let time = this.state.time;
            let now = new Date();
            stateUpdate.time = now;

            let timeStep = (now - time)/1000.0 < 1.0/this.state.fps ?(now - time)/1000.0 : 1.0/this.state.fps;
            this.world.Step(timeStep, 2, 2);

            let boxes = [];
            this.state.boxes.forEach((box) => {
                box.update();
                if (box.x < -2*box.w || box.x > this.state.worldWidth + 2*box.w) {
                    this.world.DestroyBody(box.body);
                    box.body = null;
                } else {
                    boxes.push(box);
                }
            });
            stateUpdate.boxes = boxes;

            let inputs = [];
            let sCount = 0.1;
            let timerTick = Math.floor((now - this.state.startTime) / (sCount*1000.0)) !== Math.floor((time - this.state.startTime) / (sCount*1000.0));

            let activeInputs = 0;
            this.state.inputs.forEach((box) => {
                if (box.active) activeInputs++;
            });

            if (activeInputs === 0) {
                if (this.state.saved !== 5) {
                    stateUpdate.gameOver = true;
                } else {
                    stateUpdate.youWin = true;
                }
            }

            this.state.inputs.forEach((box) => {
                box.update();
                if (box.x < -1.0*box.w || box.x > this.state.worldWidth + 1.0*box.w || box.y > this.state.worldHeight + box.w/2.0) {
                    if (box.active) {
                        this.world.DestroyBody(box.body);
                        box.body = null;
                        box.active = false;
                        stateUpdate.losed = this.state.losed + 1;
                    }
                } else {
                    if (box.active && timerTick) {
                        box.vx = box.dir*50.0/activeInputs + box.dir*box.vxRand*box.hitPoints/250.0;
                        box.vy = 10 + 35.0/activeInputs;
                        box.body.SetLinearVelocity(new _this.Box2D.b2Vec2(box.vx, box.vy));
                    }
                    if ((box.y < box.h || box.hitPoints <= 0) && box.active) {
                        stateUpdate.saved = this.state.saved + 1;
                        box.hitPoints = 0;
                        box.active = false;
                        box.vx = 0;
                        box.vy = 0;
                        box.time = new Date();
                        box.lifetime = 2000.0;
                    }
                    if (now - box.time > box.lifetime && box.lifetime > 0) {
                        this.world.DestroyBody(box.body);
                        box.body = null;
                    } else {
                        inputs.push(box);
                    }
                }
            });
            stateUpdate.inputs = inputs;

            let bullets = [];
            this.state.bullets.forEach((bullet) => {
                bullet.update();
                if (now - bullet.time > bullet.lifetime) {
                    this.world.DestroyBody(bullet.body);
                    bullet.body = null;
                } else {
                    bullets.push(bullet);
                }
            });
            stateUpdate.bullets = bullets;
        }
        this.setState(stateUpdate);
    }
    makeExplosion(e) {
        if (e.target.className !== 'box' && e.target.className !== 'input-box' && this.state.gameStarted) {
            let explosionCenter = {x: e.clientX, y: this.state.worldHeight - e.clientY};
            for (let i = 0; i < 360; i += 10) {
                let ang = (i * Math.PI / 180.0);
                let bullet = new Bullet({
                    r: 1,
                    x: explosionCenter.x + 2.0 * Math.cos(ang),
                    y: explosionCenter.y + 2.0 * Math.sin(ang),
                    color: 'green'
                });
                let vel = 1000000.0;
                this.state.bullets.push(bullet);
                var bd = new this.Box2D.b2BodyDef();
                bd.set_type(this.Box2D.b2_dynamicBody);
                bd.set_position(new this.Box2D.b2Vec2(bullet.x, bullet.y));
                var circleShape = new this.Box2D.b2CircleShape();
                circleShape.set_m_radius(bullet.r);
                bullet.body = this.world.CreateBody(bd);
                bullet.body.type = 'bullet';
                bullet.body.item = bullet;
                bullet.body.CreateFixture(circleShape, bullet.m);
                bullet.body.SetLinearVelocity(new this.Box2D.b2Vec2(vel * Math.cos(ang), vel * Math.sin(ang)));
                bullet.worldHeight = this.state.worldHeight;
            }
        }
    }
    createForm(formInputs) {
        let _this = this;
        formInputs.forEach((item) => {
            let box = new Box({
                w: item.w,
                h: item.h,
                x: item.x,
                y: item.y,
                dir: Math.random() > 0.5 ? 1 : -1,
                input: item.type,
                value: item.value,
                angle: 0,
                active: true,
                color: 'blue'
            });

            _this.state.inputs.push(box);
            var bd = new _this.Box2D.b2BodyDef();
            bd.set_type(_this.Box2D.b2_dynamicBody);
            bd.set_position(new _this.Box2D.b2Vec2(box.x, box.y));
            bd.set_angle(box.angle * Math.PI / 180);
            var shape = new _this.Box2D.b2PolygonShape();
            shape.SetAsBox(box.w / 2.0, box.h / 2.0);
            box.body = _this.world.CreateBody(bd);
            box.body.type = 'input';
            box.body.item = box;
            box.body.CreateFixture(shape, box.m);
            box.worldHeight = _this.state.worldHeight;
        });
    }
    addBoxes() {
        if (this.Box2D) {
            for (let i = 0; i < 40; i++) {
                let box = new Box({
                    w: 30,
                    h: 30,
                    x: this.state.worldWidth/4 + (this.state.worldWidth/2.0) *Math.random(),
                    y: this.state.worldHeight + 30*Math.random() + 30 + (i > 10 ? 400 : 0) + (i > 20 ? 400 : 0) + (i > 30 ? 400 : 0),
                    angle: 0,
                    color: 'red'
                });

                this.state.boxes.push(box);
                var bd = new this.Box2D.b2BodyDef();
                bd.set_type(this.Box2D.b2_dynamicBody);
                bd.set_position(new this.Box2D.b2Vec2(box.x, box.y));
                bd.set_angle(box.angle * Math.PI / 180);
                var shape = new this.Box2D.b2PolygonShape();
                shape.SetAsBox(box.w / 2.0, box.h / 2.0);
                box.body = this.world.CreateBody(bd);
                box.body.CreateFixture(shape, box.m);
                box.worldHeight = this.state.worldHeight;
            }
        }
    }
    inputChange(e, field) {
        let form = this.state.form;
        if (field !== 'agreement') {
            form[field] = e.target.value;
        } else {
            form[field] = !form[field];
        }
        if (field === 'text') {
            if (form[field].length > this.state.textAreaValidText.length) {
                form[field] = this.state.textAreaValidText;
            } else {
                form[field] = this.state.textAreaValidText.substr(0, form[field].length);
            }
        }
        this.setState({form: form});
        localStorage.setItem('form', JSON.stringify((form)));
    }
    startGame() {
        this.setState({showAlert: false});
        let _this = this;
        window.setTimeout(() => {
            let formInputs = [];
            let inputTypes = {
                name: 'text',
                ddlOption: 'select',
                count: 'number',
                text: 'textarea',
                agreement: 'checkbox'
            };
            for (let key in _this.state.form) {
                if (_this.state.form.hasOwnProperty(key)) {
                    let pos = _this.state.refs[key].current.getBoundingClientRect();
                    formInputs.push({
                        w: pos.width,
                        h: pos.height,
                        x: pos.x + pos.width / 2,
                        y: _this.state.worldHeight - pos.y - pos.height / 2,
                        type: inputTypes[key],
                        value: _this.state.form[key]
                    });
                }
            }
            _this.createForm(formInputs);
            _this.setState({gameStarted: true});
        }, 100);
    }
    sendForm() {
        let error = '';
        let gCaptcha = window.grecaptcha.getResponse();

        if (gCaptcha === '') {
            error = 'Поставьте галочку "Я не робот"';
        }

        if (error === '') {
            if (this.state.form.name.trim() === '') {
                error = 'Введите Ваше имя';
            } else {
                let wrongName = this.state.wrongName;
                if (wrongName === '') {
                    wrongName = this.state.form.name;
                    this.setState({wrongName: wrongName});
                }

                if (this.state.form.name.trim().toLowerCase() === wrongName.trim().toLowerCase()) {
                    error = 'В рамках текущей версии visApi Вас не могут звать ' + wrongName + '. Попробуйте сменить имя.';
                }
            }
        }
        if (error === '') {
            if (isNaN(this.state.form.count) || this.state.form.count === 0 || this.state.form.count < 0) {
                error = 'Похоже у Вас недостаточно опыта на проектах Visiology или Вы ошиблись с числом проектов.';
            }
        }
        if (error === '') {
            error = this.state.ddlErrors[this.state.ddlOptions.indexOf(this.state.form.ddlOption)];
            if (!error) error = '';
        }
        if (error === '') {
            if (this.state.form.agreement) {
                error = 'Похоже Вы случайно поставили галочку "Не предлагать мне больше проекты на Visiology", убедитесь что сняли ее прежде чем продолжить';
            }
        }

        this.setState({formError: error});
        if (error === '') {
            this.setState({showAlert: true});
        }
    }
    render() {
        let _this = this;
        if (this.timer) {
            window.clearTimeout(this.timer);
        }
        this.timer = window.setTimeout(function () {
            _this.timerStep();
        }, 1000/_this.state.fps);
        return (
            <div className='my-form' onClick={this.makeExplosion.bind(this)}>
                {
                    this.state.showAlert ? <div className="alerts-bg">
                        <div className="alert-block">
                            Похоже произошел какой-то сбой в visApi.<br/>
                            Ваша форма по ошибке отправлена на сервер Пентагона,
                            а сервера Visiology падают прямо в Ваш браузер.<br/>
                            Используйте мышь чтобы остановить отправку полей формы.<br/><br/>
                            <div className='form-footer'>
                                <div className='form-btn' onClick={this.startGame.bind(this)}>
                                    OK
                                </div>
                            </div>
                        </div>
                    </div> : ''
                }
                {
                    this.state.gameOver ? <div className="alerts-bg">
                        <div className="alert-block">
                            Вы не успели остановить все поля формы.<br/>
                            С Вашего компьютера на сервера Пентагона поступили странные запросы. За Вами уже выехали.
                        </div>
                    </div> : ''
                }
                {
                    this.state.youWin ? <div className="alerts-bg">
                        <div className="alert-block">
                            Отлично! Вам удалось остановить отправку формы на ошибочный адрес. Может быть в следующий раз visApi отправит Ваш отзыв по назначению.
                        </div>
                    </div> : ''
                }
                { !this.state.gameStarted ? <div>
                    <div className='form-header'>
                        Помогите нам стать лучше!<br/>
                        Расскажите о Вашем опыте работы с системой
                        <br/>
                        Visiology
                        <br/><br/>
                    </div>
                    <div className='form-row'>
                        <div className='input-caption'>Ваше имя<span>*</span></div>
                        <div className='form-inputs' ref={this.state.refs.name}>
                            <input type='text' value={this.state.form.name} onChange={ (e) => { this.inputChange(e, 'name') } } />
                        </div>
                    </div>
                    <div className='form-row'>
                        <div className='input-caption'>Количество проектов<span>*</span></div>
                        <div className='form-inputs' ref={this.state.refs.count}>
                            <input type='number' value={this.state.form.count} onChange={ (e) => { this.inputChange(e, 'count') } } />
                        </div>
                    </div>
                    <div className='form-row'>
                        <div className='input-caption'>Какое утверждение наиболее точно отражает Ваше отношение к Visiology?<span>*</span></div>
                        <div className='form-inputs' ref={this.state.refs.ddlOption}>
                            <select onChange={ (e) => { this.inputChange(e, 'ddlOption') } } placeholder={'Укажите основную причину'}>
                                {this.state.ddlOptions.map((option, i) => <option key={i}>{option}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className='form-row for-checkbox'>
                        <div className='form-inputs' ref={this.state.refs.agreement}>
                            <div className={ `checkbox ${this.state.form.agreement ? "checked" : "unchecked"}` } onClick={ (e) => { this.inputChange('', 'agreement') } }></div>
                        </div> <span className='checkbox-label' onClick={ (e) => { this.inputChange('', 'agreement') } }> Не предлагать мне больше проекты на Visiology</span>
                    </div>
                    <div className='form-row'>
                        <div className='input-caption'>Ваши предложения по улучшению Visiology</div>
                        <div className='form-inputs' ref={this.state.refs.text}>
                            <textarea value={this.state.form.text} onChange={ (e) => { this.inputChange(e, 'text') } }></textarea>
                        </div>
                    </div>
                    <div className='form-footer'>
                        <div className="g-recaptcha" data-sitekey="6Lco1rodAAAAABZr3HioaHoWFpmZxXXa11HMu9HV"></div>
                        <div className='form-error'>{ this.state.formError }</div>
                        <div className='form-btn' onClick={this.sendForm.bind(this)}>
                            Отправить
                        </div>
                    </div>
                </div> : ''
                    }
                {this.state.boxes.map((box, i) => <BoxComponent box={box} key={i} />)}
                {this.state.inputs.map((box, i) => <BoxComponent box={box} key={i} />)}
                {this.state.bullets.map((bullet, i) => <BulletComponent bullet={bullet} key={i} />)}
            </div>
        )
    }
}

export default withRouter(FormComponent);