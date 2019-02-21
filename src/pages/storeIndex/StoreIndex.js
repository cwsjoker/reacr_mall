import React, { Component } from 'react';
import { Link }  from 'react-router-dom';
import { connect } from 'react-redux'
import { Spin } from 'antd';
import { getQueryString } from '../../utils/operLocation.js'
import Navigation from '../home/Navigation.js'
import StoreItem from '../../components/StoreItem'
import $home_api from '../../fetch/api/home'
import $user_api from '../../fetch/api/user'

const StoreIndex = class StoreIndex extends Component {
    constructor() {
        super()
        this.state = {
            storeIndex: 0, // 
            produceList: [], // 产品列表
            storeInfo: {}, // 店铺的基本信息
            storeNimingInfo: {}, // 店铺的挖矿信息
            available: 0, // 用户可用余额
            symbol: '',
            spinning: true
        }
    }

    componentDidMount() {
        const id = getQueryString(this.props.location.search).id;
        if (id) {
            this.setState({
                storeIndex: id
            }, () => {
                this.getList();
            })
        }
    }
    componentDidUpdate() {
        const id = getQueryString(this.props.location.search).id;
        if (id !== this.state.storeIndex) {
            this.setState({
                storeIndex: id,
                produceList: [],
                spinning: true
            }, () => {
                this.getList();
            })
        }
    }
    async getList() {
        // 获取商品列表
        $home_api.getProduceList({
            flag: "string",
            producerId: this.state.storeIndex,
            sort: "string"
        }).then(res => {
            if (res) {
                this.setState({
                    produceList: res.data.data,
                    spinning: false
                })
            }
        })

        // 获取店铺的信息
        let res_store = await $home_api.getStoreInfo({'producerId': parseInt(this.state.storeIndex)});
        if (res_store) {
            const { data } = res_store.data;
            this.setState({
                storeInfo: data,
                symbol: data.symbol
            })
            // 获取当前剩额
            let res_blance = await $user_api.getUserFinance({coinSymbol: data.symbol})
            if (res_blance &&　res_blance.data.data) {
                this.setState({
                    available: res_blance.data.data.available
                })
            }
        }


        // 获取店铺的挖矿详情
        $home_api.getStoreNimingInfo({
            'producerId': parseInt(this.state.storeIndex)
        }).then(res => {
            if (res) {
                this.setState({
                    storeNimingInfo: res.data.data[0]
                })
            }
        })

    }
    render() {
        const { spinning, storeNimingInfo } = this.state;
        const { turnover, symbol, dailyMined, remaining, yesterdayBurnt } = storeNimingInfo;
        return (
            <div className="store-main">
                <div className="store-main-nav">
                    <Navigation storeIndex={this.state.storeIndex} />
                </div>
                <div className="store-main-con">
                    <div className="store-title">
                        <div className="store-title-top cleafix">
                            <div className="store-title-top-img"><img src={window.BACK_URL + this.state.storeInfo.logoUrl}/></div>
                            <div className="store-title-top-info">
                                <Link to={'/storeHome?id=' +　this.state.storeIndex }>{this.state.storeInfo.name}</Link>
                                <h3><span>官方自营</span></h3>
                                <p>我的余额:<span>{this.state.available}</span><em>{this.state.symbol}</em><a href={window.BT_URL + "market?symbol=" + symbol + "_BT"}>去交易</a></p>
                            </div>
                        </div>
                        <div className="flagBom cleafix">
                            <div className="flagLine"></div>
                            <div className="flagLine1"></div>
                            <ul>
                                <li>
                                    <h2>流通总量：</h2>
                                    <p>{turnover || 0}</p>
                                </li>
                                <li>
                                    <h2>今日已产出：{symbol}</h2>
                                    <p>{dailyMined || 0}</p>
                                </li>
                                <li>
                                    <h2>今日待产出：{symbol}</h2>
                                    <p>{remaining || 0}</p>
                                </li>
                                <li>
                                    <h2>昨日已销毁：{symbol}</h2>
                                    <p>{yesterdayBurnt || 0}</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="store-list">
                        <div className="title">
                            <i></i>
                            <h2>{this.state.storeInfo.name}</h2>
                        </div>
                        <Spin tip="Loading..." spinning={spinning}>
                            <ul className="cleafix" style={{minHeight: '600px'}}>
                                {
                                    this.state.produceList.map((item, index) => {
                                        return (
                                            <StoreItem key={index} data={{...item}} />
                                        )       
                                    })
                                }
                            </ul>
                        </Spin>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect()(StoreIndex);