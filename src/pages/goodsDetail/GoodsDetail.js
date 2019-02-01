import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux'
import { message } from 'antd';

import Breadcrumbs from '../../components/Breadcrumb.js';
import { getQueryString } from '../../utils/operLocation.js'
import { operateScript, unescapeHTML } from '../../utils/operation.js';
import { setShopCartNum } from '../../store/actionCreators.js';


import $home_api from '../../fetch/api/home'

class GoodsDetail extends Component {
    constructor() {
        super()
        this.state = {
            goodsInfo_goods: {}, // 商品资料
            goodsParam: [],  //商品详细资料配置
            goodsInfo_goodsInventory: {}, // 商品可选组别的列表
            goodsInfo_keyList: [], // 商品可选组别
            goodsInfo_price: {},  //商品价格信息
            storeInfo: {}, // 店铺信息
            nimingInfo: {}, // 店铺挖矿信息
            change_price_usdt: 0, //当前价格换算为usdt的估值
            niming_show: true, // 挖矿信息弹窗显示
            choose: [], //已选择配置
            buy_number: 1, //购买数量
            Breadcrumb_list: [], //面包屑数据
        }
    }
    async componentDidMount() {
        const { goodsId } = getQueryString(this.props.location.search);
        if (goodsId) {
            // 获取商品信息
            const goodsDetail_res = await $home_api.getGoodsDetail({'goodsId': goodsId});
            if (goodsDetail_res) {
                const { goods, goodsInventory, keyList } = goodsDetail_res.data.data;
                const { producerId, name } = goods;
                this.setState({
                    goodsInfo_goods: goods,
                    goodsInfo_goodsInventory: goodsInventory,
                    goodsInfo_keyList: keyList,
                    goodsParam: JSON.parse(goods.goodsParam),
                });

                // 初始化默认选择第一个配置
                const choose_list = keyList.map(item => {
                    return goodsInventory[item][0]['id'];
                })
                this.setState({
                    choose: choose_list
                }, () => {
                    this.getForByGoodsPrice(goodsId)
                })
                
                // 获取商品所在商铺的详情
                const storeInfo_res = await $home_api.getStoreInfo({'producerId': producerId});
                if (storeInfo_res) {

                    // 初始化面包屑数据
                    const list = [
                        {name: '商城', line: '/', is_line: true},
                        {name: storeInfo_res.data.data.name, line: '/storeIndex?id=' + producerId, is_line: true},
                        {name: name, line: '', is_line: false},
                    ]

                    this.setState({
                        storeInfo: storeInfo_res.data.data,
                        Breadcrumb_list: list
                    })
                }
                
                // 挖矿
                const niming_res = await $home_api.getDayNiming({'producerId': producerId})
                if (niming_res) {
                    this.setState({
                        nimingInfo: niming_res.data.data[0]
                    })
                }

                // 插入客服脚本
                operateScript(producerId);
            }
        }
    }
    // 根据型号查询商品的价格信息
    async getForByGoodsPrice(goodsId) {
        const propertyGroup = this.state.choose.join(',');
        const priceInfo_res = await $home_api.getByGoodsQueryPrice({'goodsId': goodsId, 'propertyGroup': propertyGroup})
        if (priceInfo_res) {
            this.setState({
                goodsInfo_price: priceInfo_res.data.data
            })
            const { price, symbol } = priceInfo_res.data.data;
            this.trnasformUSDT(price, symbol);
        }
    }
    // 获取币种转未usdt的换算值
    async trnasformUSDT(price, symbol) {
        const usdt_res = await $home_api.getUSDT({coinAmount: price, originalType: symbol});
        if (usdt_res) {
            // console.log(usdt_res);
            this.setState({
                change_price_usdt: usdt_res.data.data.targetCoinAmount
            })
        }
    }

    // 挖矿弹窗显示隐藏
    change_niming() {
        this.setState({niming_show: !this.state.niming_show});
    }

    // 切换颜色版本号
    choose_color_model(v) {
        // 选择已经选择的id直接返回
        if (this.state.choose.includes(v.id)) {
            return;
        }
        // 先获取选择配置位于哪个组别
        let list = [];
        this.state.goodsInfo_keyList.forEach(item => {
            this.state.goodsInfo_goodsInventory[item].forEach(item1 => {
                if (item1.id === v.id) {
                    // console.log(item);
                    list = this.state.goodsInfo_goodsInventory[item];
                }
            })
        })
        // 将该组别的在已选择的全部移除， 并把当前选择加入新配置数组中,更新state后重新请求价格
        let choose_list = this.state.choose;
        list.forEach(item => {
            if (choose_list.includes(item.id)) {
                choose_list.forEach((item1, i) => {
                    if (item1 === item.id) {
                        choose_list.splice(i, 1);
                    }
                })
            }
        })
        choose_list.push(v.id);
        this.setState({
            choose: choose_list
        }, () => {
            const { goodsId } = getQueryString(this.props.location.search);
            this.getForByGoodsPrice(goodsId);
        })
        
    }
    // 增加减少购买数量
    changeBuyNumber(type) {
        if (type === 'reduce') {
            if (this.state.buy_number === 1) return;
            this.setState({
                buy_number: this.state.buy_number - 1
            })
        }

        if (type === 'add') {
            this.setState({
                buy_number: this.state.buy_number + 1
            })
        }
    }
    // 加入购物车或者立即购买
    joinShopCart(type) {
        if (this.props.loginStore.login) {
            const buyNowGoodsInforObj = {
                'goodsId': this.state.goodsInfo_goods.id, //商品ID
                'producerId': this.state.goodsInfo_goods.producerId, //商户ID
                'storeName': this.state.storeInfo.name, //商户名称
                'goodsIntroduce': this.state.goodsInfo_price.introduce, //商品简介
                'goodsNum': this.state.buy_number, //商品数量
                'goodsPrice': this.state.goodsInfo_price.price, //商品价格
                'inventoryid': this.state.goodsInfo_price.id,//库存主键
                'goodsImgUrl': this.state.goodsInfo_price.smallImageUrl, //商品图片
                'propertyGroupGoods': this.state.choose.join(','), //库存类型
                'inventoryGoods': this.state.goodsInfo_price.stock, //库存
                'payWay': '货币支付', //支付方式
                // 'vrepeat': goodsId+inventoryid,//校验重复
                'symbol': this.state.goodsInfo_price.symbol
            };
            if (type === 'imbuy') {
                // 立即购买
                const choose_list = [];
                choose_list.push(buyNowGoodsInforObj)
                localStorage.orderList = JSON.stringify(choose_list);
                this.props.history.push('/confirmOrder');
            } else {
                // 加入购物车
                let list = JSON.parse(localStorage.getItem('shopCartList')) || [];
                // console.log(list);
                // 1.商品id不同  2.id相同类型不同  3.id相同类型相同数量叠加
                let is_goods = false;
                list.forEach(v => {
                    if (v.goodsId === buyNowGoodsInforObj.goodsId && v.propertyGroupGoods.split(',').sort().join(',') === buyNowGoodsInforObj.propertyGroupGoods.split(',').sort().join(',')) {
                        v.goodsNum += buyNowGoodsInforObj.goodsNum;
                        is_goods = true;
                    }
                })
                if (!is_goods) {
                    list.push(buyNowGoodsInforObj);
                }
                localStorage.setItem('shopCartList', JSON.stringify(list));
                this.props.dispatch(setShopCartNum(list.length));
                message.success('商品已成功加入购物车');
            }
        } else {
            message.error('用户未登录');
        }
    }
    // 呼叫客服
    qimoChatClick() {
        window.qimoChatClick();
    }
    render() {
        let niming_dom = null;
        if (this.state.niming_show) {
            niming_dom = (
                <div className="bubble-box">
                    <em onClick={this.change_niming.bind(this)}></em>
                    <span className="bot"></span>
                    <p>1.买卖商户均为实地考察认证商户，并提供100万usdt保证金，您每次兑换会冻结资产</p>
                    <p>2.买卖商户均为实名认证商</p>
                    <p className="may-niming-coin">今日剩余可挖：{this.state.nimingInfo.remaining}{this.state.nimingInfo.symbol}</p>
                </div>
            )
        }

        return (
            <div className="goodsDetail-page">
                {/* 面包屑 */}
                <div className="breadcrumb-navigation">
                    <div className="breadcrumb-navigation-main">
                        <Breadcrumbs list={this.state.Breadcrumb_list} />
                        <div>
                            <div className="storeLogo">
                                <b>自营</b>
                                <strong>{this.state.storeInfo.name}</strong>
                            </div>
                            <div className="customer-server" onClick={this.qimoChatClick}>在线客服</div>
                        </div>
                    </div>
                </div>
                {/* 商品信息 */}
                <div className="goodsDetail-main">
                    <div className="goods-info">
                        <div className="goodsImg">
				            <img src={window.BACK_URL + this.state.goodsInfo_price.smallImageUrl} />
			            </div>
                        <div className="goodsMain">
                            <h2>{this.state.goodsInfo_goods.name}</h2>
                            <ul className="cleafix">
                                <li>
                                    <div className="price">
                                        <label>价格</label>
                                        <span><em>{this.state.goodsInfo_price.price} {this.state.goodsInfo_price.symbol}</em> <i onClick={this.change_niming.bind(this)}></i> ≈ {this.state.change_price_usdt} USDT </span>
                                        <div className="salesDiv">
                                            <b>累计销量</b>
                                            <b>{this.state.goodsInfo_price.sales}</b>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <label>简介</label>
                                    <p>{this.state.goodsInfo_price.introduce}</p>
                                </li>
                                    {
                                        this.state.goodsInfo_keyList.map((item, index) => {
                                            return (
                                                <li  className="inventoryDiv" key={index}>
                                                    <label>{item}</label>
                                                    <div className="versionDiv">
                                                        {
                                                            this.state.goodsInfo_goodsInventory[item].map((v, i) => {
                                                                return (
                                                                    <span 
                                                                        key={i}
                                                                        className={ this.state.choose.includes(v.id) ? 'on' : '' }
                                                                        onClick={this.choose_color_model.bind(this, v)}
                                                                    >{v.name}</span>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </li>
                                            )
                                        })
                                    }
                                <li>
                                    <label>购买方式</label>
                                    <div className="payWay">
                                        <span className="on">货币支付</span>
                                    </div>
                                </li>
                                <li>
                                    <label>数量</label>
                                    <div className="trdiv">
                                        <button className="button2" onClick={this.changeBuyNumber.bind(this, 'reduce')}>-</button>
                                        <input  type="text" className="qty_item" readOnly="readonly" value={this.state.buy_number} />
                                        <button  className="button1" onClick={this.changeBuyNumber.bind(this, 'add')}>+</button>
                                    </div>
                                </li>
                                <li>
                                    <div className="btnBox">
                                        <a href="javascript:;" onClick={this.joinShopCart.bind(this, 'imbuy')}>立即购买</a>
                                        <a className="joinCat" href="javascript:;" onClick={this.joinShopCart.bind(this, 'shopcart')}>加入购物车</a>
                                    </div>
                                </li>
                            </ul>
                            {niming_dom}
                        </div>
                    </div>
                    {/* 商品详情 */}
                    <div className="goods-detail">
                        <div className="goodsTop">
                            <div className="goodsTab cleafix">
                                <span>商品介绍</span>
                            </div>
                            <div className="goodsBox">
                                <ul>
                                    {/* <li v-for="param in goodsParam">
                                        <p>{{param.key}}：<span>{{param.value}}</span></p>
                                    </li> */}
                                    {
                                        this.state.goodsParam.map((item, index) => {
                                            return (
                                                <li key={index}>
                                                    <p>{item.key}：<span>{item.value}</span></p>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                        <div className="divOne goodsBom">
                            <span dangerouslySetInnerHTML={{ __html: unescapeHTML(this.state.goodsInfo_goods.detail)}}>
                            </span>
                        </div>        
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return { loginStore: state.login }
}

export default withRouter(connect(mapStateToProps)(GoodsDetail));