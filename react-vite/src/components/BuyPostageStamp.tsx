import { useEffect, useState } from "react";
import { usePostageBatch } from "../hooks/usePostageBatch";
import { UTILIZATION_TABLE } from "../utils";

type PostageUploadState = {
  numOfDays: number | string;
  depth: number | string;
  label?: string;
  mutable: boolean;
  [index: string]: any;
};

const GNOSIS_BLOCKTIME_IN_SECONDS = 5;

const MINIMUM_POSTAGE_STAMPS_DEPTH = 21;
const UNIT_OF_CHUNK = 4 * 1024; // 4kb

export const BuyPostageStamp = () => {
  const [buyBtn, setBuyBtn] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [stampPrice, setStampPrice] = useState(24000);

  const [values, setValues] = useState<PostageUploadState>({
    numOfDays: "",
    depth: "",
    label: "",
    mutable: false,
  });

  const {
    newlyCreatedStampId,
    errorCreatingPostage,
    setErrorCreatingPostage,
    createPostageBatch,
    creatingPostage,
    getAllPostageStamps,
  } = usePostageBatch();

  useEffect(() => {
    getAllPostageStamps();
  }, [newlyCreatedStampId]);

  const handleOnchange = (
    e: React.FormEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const target = e.currentTarget;
    const name = target.name;
    const value = target.value;

    setValues((preState) => ({ ...preState, [name]: value }));
  };

  const createPostageStamp = async (e: any) => {
    e.preventDefault();

    if (
      values.numOfDays == "" ||
      values.label == "" ||
      values.depth == "" ||
      Number(values.depth) < MINIMUM_POSTAGE_STAMPS_DEPTH ||
      Number(values.numOfDays) <= 0
    ) {
      setIsRequired(true);
      return;
    }

    try {
      setIsRequired(false);

      await createPostageBatch({
        amount: estimatedAmountForTTL(),
        depth: Number(values.depth),
        options: {
          label: values.label,
          immutableFlag: values.mutable,
        },
      });

      setValues({
        numOfDays: "",
        depth: "",
        label: "",
        mutable: false,
      });
    } catch (e: any) {
      console.error(e);
    } finally {
      e.target.reset();
    }
  };

  const estimateStorageSize = () => {
    return {
      effectiveStorageVolume: 2 ** Number(values.depth),
      theoreticalStorageVolume: 2 ** Number(values.depth) * UNIT_OF_CHUNK,
    };
  };

  const estimatedAmountForTTL = () => {
    // Estimating `amount` needed for desired TTL
    const secsPerDay = 24 * 60 * 60;
    const storageTimeInSeconds = Number(values.numOfDays) * secsPerDay;

    const amount =
      (stampPrice / GNOSIS_BLOCKTIME_IN_SECONDS) * storageTimeInSeconds;

    return amount;
  };

  return (
    <section className="flex flex-col space-y-4 bg-slate-200 p-8">
      <h2 className="text-2xl mb-6">Postage Stamp</h2>
      {!buyBtn && (
        <button
          className={`text-xl border-2 border-solid bg-gray-600 text-white w-56 p-2 hover:bg-yellow-500 hover:cursor-pointer hover:text-black`}
          type="submit"
          onClick={() => setBuyBtn(!buyBtn)}
        >
          Buy Stamp
        </button>
      )}

      {buyBtn && (
        <form onSubmit={createPostageStamp}>
          <div className="flex flex-col justify-between sm:flex-row ">
            <div className="flex-col space-y-2 mb-4 text-stone-500 font-medium sm:min-w-[45%]">
              <div className="mb-2">
                <label htmlFor="depth">Depth</label>
                <input
                  className="p-4 border-[1px] w-full"
                  type="number"
                  value={values["depth"]}
                  id="depth"
                  name="depth"
                  placeholder="Depth size"
                  min={MINIMUM_POSTAGE_STAMPS_DEPTH}
                  onChange={handleOnchange}
                />
              </div>
              <div>
                {isRequired && values.depth == "" && (
                  <span className="text-red-500 font-normal">
                    Please enter a depth size
                  </span>
                )}

                {values.depth !== "" &&
                  Number(values.depth) < MINIMUM_POSTAGE_STAMPS_DEPTH && (
                    <span className="text-red-500 font-normal">
                      Minimum depth is {MINIMUM_POSTAGE_STAMPS_DEPTH}
                    </span>
                  )}

                {values.depth && (
                  <span className="flex flex-col space-y-1 my-2 font-normal">
                    <h3 className="font-semibold">Estimated file size</h3>
                    <span>
                      Theoretical:{" "}
                      {values.depth &&
                        UTILIZATION_TABLE(String(values.depth))
                          .theoreticalMaxVolume}
                      {/*  
                      {convertBytes(
                        estimateStorageSize().theoreticalStorageVolume
                      )}
                      */}
                    </span>
                    <span>
                      Effective:{" "}
                      {/* {convertBytes(
                        estimateStorageSize().effectiveStorageVolume
                      )} */}
                      {values.depth &&
                        UTILIZATION_TABLE(String(values.depth)).effectiveVolume}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex-col space-y-2 text-stone-500 font-medium sm:min-w-[45%]">
              <div className="mb-2">
                <label htmlFor="numOfDays">Duration:</label>
                <input
                  className="p-4 border-[1px] w-full"
                  type="number"
                  id="numOfDays"
                  name="numOfDays"
                  min="1"
                  max="365"
                  placeholder="Number of Days"
                  onChange={handleOnchange}
                />
              </div>
              <span aria-describedby="error">
                {Number(values.numOfDays) != 0 && values.numOfDays && (
                  <span className="flex flex-row justify-between font-normal">
                    <span>Estimated cost: {estimatedAmountForTTL()} PLUR</span>
                  </span>
                )}

                {isRequired && values.numOfDays === "" && (
                  <span className="mt-2 text-red-500">
                    Please enter a duration
                  </span>
                )}
                {values.numOfDays != "" && Number(values.numOfDays) <= 0 && (
                  <span className="mt-2 text-red-500">
                    Minimium duration is 1
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-between sm:flex-row">
            <div className="flex-col space-y-2 mb-4 text-stone-500 font-medium sm:min-w-[45%]">
              <div className="mb-2">
                <label htmlFor="label">Batch Label </label>
                <input
                  className="p-4 border-[1px] w-full"
                  type="text"
                  value={values["label"]}
                  id="label"
                  name="label"
                  placeholder="Name of Batch"
                  onChange={handleOnchange}
                />
              </div>
              <span aria-describedby="error">
                {isRequired && values.label === "" && (
                  <span className="mt-2 text-red-500">
                    Please enter a label
                  </span>
                )}
              </span>
            </div>

            <div className="flex-col space-y-2 text-stone-500 font-medium sm:min-w-[45%]">
              <label htmlFor="mutable">Mutable</label>
              <select
                name="mutable"
                id="mutable"
                className="p-4 text-stone-500 border-[1px] w-full"
                onChange={handleOnchange}
              >
                <option
                  disabled
                  className="text-slate-600 font-semibold"
                  value={"Select option"}
                >
                  Select option
                </option>
                {Array.from(["No", "Yes"]).map((e, i) => (
                  <option defaultValue={e} key={i}>
                    {e.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-x-4 mt-8">
            <button
              className={`text-xl border-2 border-solid bg-gray-600 text-white w-40 ${
                values.amount === "" &&
                (values.depth === ""
                  ? "hover:cursor-not-allowed hover:bg-slate-600 text-slate-400"
                  : "hover:bg-yellow-500 hover:cursor-pointer  hover:text-black")
              } p-4`}
            >
              {creatingPostage ? "Processing..." : "Buy"}
            </button>
            <button
              className={`text-xl border-2 border-solid bg-gray-600 text-white w-40 p-4 hover:bg-yellow-500 hover:cursor-pointer hover:text-black`}
              onClick={() => {
                setIsRequired(false);

                setBuyBtn(!buyBtn);
                setErrorCreatingPostage({ hasError: false, msg: "" });
                setValues({
                  numOfDays: "",
                  depth: "",
                  mutable: false,
                  label: "",
                });
              }}
            >
              Cancel
            </button>
          </div>

          {newlyCreatedStampId == "" && errorCreatingPostage.hasError && (
            <div aria-describedby="error" className="mt-4">
              <p className="text-red-500 space-y-2">
                <span>Error Creating Postage:</span>
                {JSON.stringify(errorCreatingPostage.msg)}
              </p>
            </div>
          )}
        </form>
      )}
    </section>
  );
};
