import { For, Show, createResource, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { create } from "domain";

interface Merchandise {
  name: string,
  price: number,
  amount: number,
}
interface MerchandiseRow {
  merchandise: Merchandise,
  inModifiedMode: boolean,
}
interface MerchandiseDTO {
  merchandises: Merchandise[],
  minimum_threshold: number,
  discount: number,
}
interface Combine {
  total_amount:number,
  price: number,
  discount_price: number,
  quantities_combine: number[],
  cost_performance_ratio: number,
  cost_per_unit: number,
}
interface CombineList {
  merchandises: Merchandise[],
  combines: Combine[],
  minimum_threshold: number,
  discount: number,
}
function App() {
  let formData = {
    name: document.createElement('input'),
    price: document.createElement('input'),
    amount: document.createElement('input'),
    minimum_threshold_price: document.createElement('input'),
    discount: document.createElement('input'),
  };
  const [candidateMerchandise, setCandidateMerchandise] = createStore<MerchandiseRow[]>([]);
  const [combineList, setCombineList] = createStore<CombineList>({
    merchandises: [], combines: [], minimum_threshold: 0, discount: 0
  });

  const caculateDiscount = async () => {
    const dto: MerchandiseDTO = {
      merchandises: candidateMerchandise.map(r => r.merchandise),
      minimum_threshold: parseFloat(formData.minimum_threshold_price.value),
      discount: parseFloat(formData.discount.value),
    }
    const combines = await invoke<CombineList>("max_discount", { merchandiseDto: dto });
    setCombineList(combines);
  }

  const clearMerchandise = () => {
    setCandidateMerchandise([]);
  }

  const getMerchandiseInfo = () => {
    return {
      merchandise: {
        name: formData.name.value,
        price: parseInt(formData.price.value),
        amount: parseInt(formData.amount.value),
      },
      inModifiedMode: false
    }
  }
  const enterMerchandise = () => {
    setCandidateMerchandise(old => [...old, getMerchandiseInfo()])
  }
  const deleteRow = (index:number)=>{
    setCandidateMerchandise(
      rows=>rows.filter((r,i)=>i !==index)
    )
  }
  const saveModified = (merchandise:Merchandise,index:number)=>{
    setCandidateMerchandise(
      index,
      _=>{return {merchandise,inModifiedMode:false};},
    )
  }
  const openModified = (index:number)=>{
    setCandidateMerchandise(
      index,
      old=>{return {...old,inModifiedMode : true}},
    )
  }
  function ModifiedRow(props:{row: MerchandiseRow ,index:number}) {
    const {row,index} = props;
    const inputData ={
      name: document.createElement('input'),
      price:document.createElement('input'),
      amount:document.createElement('input'),
    }
    const getModidfied = ()=>{
      const modified:Merchandise ={
        name:inputData.name.value,
        price:parseFloat(inputData.price.value),
        amount:parseFloat(inputData.amount.value),
      }
      return modified;
    }
    return (<div class="grid grid-cols-6 gap-4 w-3/4">
      <input ref={inputData.name}  value={row.merchandise.name} ></input>
      <input ref={inputData.price} value={row.merchandise.price}></input>
      <input ref={inputData.amount} value={row.merchandise.amount}></input>
      <p>{row.merchandise.amount /row.merchandise.price}</p>
      <p>{row.merchandise.price /row.merchandise.amount}</p>
      <button onclick={()=>saveModified(getModidfied(),index)}>Save</button>
    </div>)
  }

  return (
    <>
      <h1>Max Your Discount!</h1>
      <div class="flex justify-center">
        <input
          ref={formData!.name}
          placeholder="輸入商品名稱..."
        />
        <input
          ref={formData!.price}
          placeholder="輸入價格..."
        />
        <input
          ref={formData!.amount}
          placeholder="輸入總量..."
        />

        <button onClick={enterMerchandise} type="button">Enter</button>
        <button onClick={caculateDiscount} type="button">Caculate</button>
        <button onClick={clearMerchandise} type="button">Clear</button>

      </div>
      <div class="flex justify-center">
        <input
          ref={formData!.minimum_threshold_price}
          placeholder="輸入最低限度金額..."
        />
        <input
          ref={formData!.discount}
          placeholder="輸入折扣金額..."
        />
      </div>
      <div class="flex justify-center flex-wrap">
      <div class="grid grid-cols-7 gap-4 w-3/4">
        <p>商品名稱</p>
        <p>價格</p>
        <p>數量</p>
        <p>CP值</p>
        <p>$/unit</p>
      </div>
      <div class="w-3/4">
        <For each={candidateMerchandise}>
          {(row,index) => (
            <Show when={!row.inModifiedMode}
              fallback={<ModifiedRow row={row} index={index()} />}
            >
              <div class="grid grid-cols-7 gap-4 w-3/4">
                <p>{row.merchandise.name}</p>
                <p>{row.merchandise.price}</p>
                <p>{row.merchandise.amount}</p>
                <p>{row.merchandise.amount / row.merchandise.price}</p>
                <p>{row.merchandise.price / row.merchandise.amount}</p>
                <button onclick={()=>openModified(index())}>Modified</button>
                <button onclick={()=>deleteRow(index())}>Delete</button>
              </div>
            </Show>
          )
          }
        </For>
      </div>
      </div>
      <div class="flex justify-around">
        <div class="flex justify-around w-1/2">
        <For each={combineList.merchandises}>
          {(merchandise) => (
            <p class="text-center">{merchandise.name}</p>
          )
          }
        </For>
        </div>
        <div class="flex justify-around w-1/3">
            <p class="text-center">總量</p>
            <p class="text-center">原價</p>
            <p class="text-center">折扣後價格</p>
            <p class="text-center">CP值</p>
            <p class="text-center">/Unit</p>
            </div>
      </div>
      <div >
        <For each={combineList.combines}>
          {(combine) => (
          <div class="flex justify-around">
          <div class="flex justify-around w-1/2">
            <For each={combine.quantities_combine}>
              {(quantity) => (
                <p class="text-center">{quantity}</p>
              )
              }
            </For>
            </div>
            <div class="flex justify-around w-1/3">
            <p class="text-center">{combine.total_amount}</p>
            <p class="text-center">{combine.price}</p>
            <p class="text-center">{combine.discount_price}</p>
            <p class="text-center">{combine.cost_performance_ratio.toFixed(4)}</p>
            <p class="text-center">{combine.cost_per_unit.toFixed(4)}</p>
            </div>
          </div>
          )
          }
        </For>
      </div>
    </>
  );
}

export default App;
