import { For, Show, createResource, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { open, save } from '@tauri-apps/api/dialog';
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
  total_amount: number,
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

  const [importPath,setImportPath] = createSignal<string | undefined>();
  const [exportPath,setExportPath] = createSignal("");
  const openMerchandiseFile = async ()=>{
    const selectedFilePath = await open(
        {
          filters:[{
            name: 'txt',
            extensions: ['txt','md']
          }],
        }
    );
    if (selectedFilePath !==null){
      setImportPath(selectedFilePath as string);
      const merDto = await invoke<MerchandiseDTO>('import_merchandise',{filePath:importPath()});
      setCandidateMerchandise(merDto.merchandises.map((mer)=>{return{merchandise:mer,inModifiedMode:false};}))
      formData.minimum_threshold_price.value = merDto.minimum_threshold.toString();
      formData.discount.value = merDto.discount.toString();
    }
  }

  const getMerchandiseDto:()=>MerchandiseDTO = ()=>{
    return {
      merchandises: candidateMerchandise.map(r => r.merchandise),
      minimum_threshold: parseFloat(formData.minimum_threshold_price.value),
      discount: parseFloat(formData.discount.value),
    }
  }
  const saveMerchandise =async ()=>{
    const filePath = await save({
      defaultPath:importPath(),
      filters:[{
        name:'txt',
        extensions:['txt','md'],
      }     ]
    });
    if (filePath !==null){
      setExportPath(filePath as string);
      invoke("save_merchandise",{filePath:filePath,merchandiseDto:getMerchandiseDto()})
    }
  }

  const caculateDiscount = async () => {
    const dto = getMerchandiseDto();
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
  const deleteRow = (index: number) => {
    setCandidateMerchandise(
      rows => rows.filter((r, i) => i !== index)
    )
  }
  const updateMerchandise = (merchandise: Merchandise, index: number) => {
    setCandidateMerchandise(
      index,
      _ => { return { merchandise, inModifiedMode: false }; },
    )
  }
  const openModified = (index: number) => {
    setCandidateMerchandise(
      index,
      old => { return { ...old, inModifiedMode: true } },
    )
  }
  function ModifiedRow(props: { row: MerchandiseRow, index: number }) {
    const { row, index } = props;
    const inputData = {
      name: document.createElement('input'),
      price: document.createElement('input'),
      amount: document.createElement('input'),
    }
    const getModidfied = () => {
      const modified: Merchandise = {
        name: inputData.name.value,
        price: parseFloat(inputData.price.value),
        amount: parseFloat(inputData.amount.value),
      }
      return modified;
    }
    return (<><div class="grid grid-cols-5 gap-1 col-start-1 col-end-10">
      <input ref={inputData.name} value={row.merchandise.name} ></input>
      <input ref={inputData.price} value={row.merchandise.price}></input>
      <input ref={inputData.amount} value={row.merchandise.amount}></input>
      <p>{row.merchandise.amount / row.merchandise.price}</p>
      <p>{row.merchandise.price / row.merchandise.amount}</p>
    </div>
      <div class="grid grid-cols-2 gap-1 col-start-10 col-end-13">
        <button onclick={() => updateMerchandise(getModidfied(), index)}>
          <span class="material-symbols-outlined">check</span>
        </button>
      </div>
    </>)
  }

  return (
    <>
      <h1>Max Your Discount!</h1>
      <div>
        <button onclick={openMerchandiseFile} type="button">Import</button>
        <span>{importPath()}</span>
        <button onclick={saveMerchandise} type="button">Export</button>
        <span>{exportPath()}</span>
      </div>
      <div class="flex justify-center">
        <div>
          <label>商品名稱:</label>
          <input
            ref={formData!.name}
            placeholder="輸入商品名稱..."
          />
        </div>
        <div>
          <label>價格:</label>
          <input
            ref={formData!.price}
            placeholder="輸入價格..."
          />
        </div>
        <div>
          <label>數量:</label>
          <input
            ref={formData!.amount}
            placeholder="輸入數量..."
          />
        </div>
        <button onClick={enterMerchandise} type="button">
          <span class="material-symbols-outlined">check</span>
        </button>
        <button onClick={caculateDiscount} type="button">
          <span class="material-symbols-outlined">calculate</span>
        </button>
        <button onClick={clearMerchandise} type="button">Clear</button>

      </div>
      <div class="flex justify-center">
        <div>
          <label>折扣最低門檻金額:</label>
          <input
            ref={formData!.minimum_threshold_price}
            placeholder="輸入最低門檻金額..."
          />
        </div>
        <div>
          <label>折扣金額:</label>
          <input
            ref={formData!.discount}
            placeholder="輸入折扣金額..."
          />
        </div>
      </div>
      <div class="contain">
        <div class="grid grid-cols-12 text-xl">
          <div class="grid grid-cols-5 col-start-1 col-end-10">
            <p>商品名稱</p>
            <p>價格</p>
            <p>數量</p>
            <p>CP值</p>
            <p>$/unit</p>
          </div>
          <For each={candidateMerchandise}>
            {(row, index) => (
              <Show when={!row.inModifiedMode}
                fallback={<ModifiedRow row={row} index={index()} />}
              >
                <div class="grid grid-cols-5 gap-1 col-start-1 col-end-10">
                  <p>{row.merchandise.name}</p>
                  <p>{row.merchandise.price}</p>
                  <p>{row.merchandise.amount}</p>
                  <p>{(row.merchandise.amount / row.merchandise.price).toFixed(4)}</p>
                  <p>{(row.merchandise.price / row.merchandise.amount).toFixed(4)}</p>
                </div>
                <div class="grid grid-cols-2 gap-1 col-start-10 col-end-13">
                  <button onclick={() => openModified(index())} class=" h-5 p-0">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button onclick={() => deleteRow(index())} class="h-5 p-0">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </Show>
            )
            }
          </For>
        </div>
        <Show when={combineList.combines.length !== 0}>
          <div class="grid grid-cols-12 mt-5">
            <div class="flex justify-around col-start-1 col-end-9">
              <For each={combineList.merchandises}>
                {(merchandise) => (
                  <p class="text-center">{merchandise.name}</p>
                )
                }
              </For>
            </div>
            <div class="grid grid-cols-5 col-start-9 col-end-13">
              <p class="text-center">總量</p>
              <p class="text-center">原價</p>
              <p class="text-center">折扣後價格</p>
              <p class="text-center">CP值</p>
              <p class="text-center">/Unit</p>
            </div>
            <For each={combineList.combines}>
              {(combine) => (
                <>
                  <div class="flex justify-around col-start-1 col-end-9">
                    <For each={combine.quantities_combine}>
                      {(quantity) => (
                        <p class="text-center">{quantity}</p>
                      )
                      }
                    </For>
                  </div>
                  <div class="grid grid-cols-5 justify-items-stretch col-start-9 col-end-13">
                    <p class="text-center">{combine.total_amount}</p>
                    <p class="text-center">{combine.price}</p>
                    <p class="text-center">{combine.discount_price}</p>
                    <p class="text-center">{combine.cost_performance_ratio.toFixed(4)}</p>
                    <p class="text-center">{combine.cost_per_unit.toFixed(4)}</p>
                  </div>
                </>
              )
              }
            </For>
          </div>
        </Show>
      </div>
    </>
  );
}

export default App;
