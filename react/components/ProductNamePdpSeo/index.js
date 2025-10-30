import { useProduct } from 'vtex.product-context';
import { classGenerator } from '../../utils/classGenerator';

const ProductNamePdpSeo = ({
    VtexFlexLayout
}) => {
  const { product } = useProduct();
  const { productName } = product;

  return (
    <VtexFlexLayout>
        <div className={classGenerator('vtex-ProductNamePdpSeo', "container")}>
            <h1 className={classGenerator('vtex-ProductNamePdpSeo', "name")}> {productName}</h1>
        </div>
    </VtexFlexLayout>
  );
}

export default ProductNamePdpSeo;