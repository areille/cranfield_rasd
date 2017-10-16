#include <iostream>
#include <vector>
#include "IntegerArraySort.h"

int main()
{
    // // With User vector input
    // int vsize = 0;
    // std::cout << "Size of the vector : " << std::endl;
    // std::cin >> vsize;

    // std::vector<int> v(vsize, 0);

    // for (int i = 0; i < vsize; i++)
    // {
    //     std::cout << "Element " << i << " of the vector :" << std::endl;
    //     std::cin >> v[i];
    // }

    // With algorithmic vector filling
    std::vector<int> v;

    srand((unsigned)time(NULL));
    // int a = rand() % 20 + 1; // random size between 0 & 20
    int a = 10000; // 1000-sized vector
    for (int i = 0; i < a; i++)
    {
        int b = rand() % 50 + 1;
        v.push_back(b);
        std::cout << v[i] << " ";
    }

    // BubbleSort(v);
    MergeSort(v);

    std::cout << "Your sorted vector is : " << std::endl;
    for (int i = 0; i < v.size(); i++)
    {
        std::cout << v[i] << " ";
    }
    return 0;
}