#include <iostream>
#include <vector>
#include "IntegerArraySort.h"

/*
* Prints out the vector in parameter
* The boolean only changes the text
*/
void printVector(std::vector<int> &v, bool sorted)
{
    if (sorted)
    {
        std::cout << "Your sorted vector is : " << std::endl;
    }
    else
    {

        std::cout << "Your unsorted vector is : " << std::endl;
    }
    std::cout << std::endl;
    for (int i = 0; i < v.size(); i++)
    {
        std::cout << v[i] << " ";
    }
    std::cout << std::endl;
    std::cout << std::endl;
}
/*
* prints out the indexes vector
*/
void printIndexVector(std::vector<int> &v)
{
    std::cout << "The indexes vector is : " << std::endl;
    std::cout << std::endl;
    for (int i = 0; i < v.size(); i++)
    {
        std::cout << v[i] << " ";
    }
    std::cout << std::endl;
    std::cout << std::endl;
}

/*
* Used to create a vector.
* If the boolean is true, the vector will be randomly created
* Else, the user will be asked to fill manually the vector
*/
std::vector<int> useAutoVectorFilling(bool b)
{
    if (b)
    {
        // Case true : random creation of the vector
        std::vector<int> v;
        srand((unsigned)time(NULL));
        int a = rand() % 10000 + 1; // creating a random size between 0 & 10.000
        for (int i = 0; i < a; i++)
        {
            int b = rand() % 1000 + 1; // creating a random value between 0 & 1.000
            v.push_back(b);            // put the previous value in the vector
        }
        return v;
    }
    else
    {
        // Case false : user creates the vector
        int vsize = 0;
        std::cout << "Size of the vector : " << std::endl;
        std::cin >> vsize;

        std::vector<int> v(vsize, 0);
        for (int i = 0; i < vsize; i++)
        {
            std::cout << "Element " << i + 1 << " of the vector :" << std::endl;
            std::cin >> v[i];
        }

        return v;
    }
}

int main()
{

    std::vector<int> v = useAutoVectorFilling(false);
    printVector(v, false);
    std::cout << std::endl;
    std::cout << std::endl;
    std::cout << std::endl;

    /*
    * Choose which method to use
    */

    std::vector<int> indexes = BubbleSort(v);
    // BubbleSort(v);
    // MergeSort(v);

    printVector(v, true);
    printIndexVector(indexes);

    return 0;
}