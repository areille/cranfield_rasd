#include <iostream>
#include <vector>
#include "IntegerArraySort.h"

int main()
{
    int vsize = 0;
    std::cout << "Size of the vector : " << std::endl;
    std::cin >> vsize;

    std::vector<int> v(vsize, 0);

    for (int i = 0; i < vsize; i++)
    {
        std::cout << "Element " << i << " of the vector :" << std::endl;
        std::cin >> v[i];
    }

    BubbleSort(v);
    // MergeSort(v);

    std::cout << "Your sorted vector is : "<< std::endl;
    for (int i = 0; i < v.size(); i++)
    {
        std::cout << v[i] << " ";
    }
    return 0;
}